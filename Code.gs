const SHEET_NAME = 'Ответы гостей';

function doGet() {
  return ContentService
    .createTextOutput('Сервис формы приглашения работает.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // Если листа ещё нет — создаём его
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);

      sheet.appendRow([
        'Дата и время',
        'Имя',
        'Присутствие',
        'Еда',
        'Напитки',
        'Дополнительные пожелания'
      ]);

      sheet.setFrozenRows(1);
    }

    // Получаем данные из формы
    const name = data.name || '';
    const attendance = data.attendance || '';
    const food = Array.isArray(data.food)
      ? data.food.join(', ')
      : (data.food || '');

    const drinks = Array.isArray(data.drinks)
      ? data.drinks.join(', ')
      : (data.drinks || '');

    const comments = data.comments || '';

    // Добавляем нового гостя
    sheet.appendRow([
      new Date(),
      name,
      attendance,
      food,
      drinks,
      comments
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Ответ успешно сохранён'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
