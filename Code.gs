/*
  Google Apps Script для сайта-приглашения Жанны, 60 лет.

  Как подключить:
  1) Создайте Google Таблицу, например "Жанна 60 — гости".
  2) В таблице: Расширения → Apps Script.
  3) Вставьте этот код вместо стандартного.
  4) Нажмите Deploy → New deployment → Web app.
  5) Execute as: Me. Who has access: Anyone.
  6) Скопируйте Web app URL.
  7) В index.html/app.js вставьте URL в GOOGLE_SCRIPT_URL.
  8) После этого ответы гостей будут собираться в таблице.

  В таблице автоматически появятся столбцы:
  Дата, Имя, Присутствие, Еда, Алкоголь (предпочтение), Безалкогольные, Пожелания.

  Для статистики в самой Google Таблице можно построить сводные таблицы/диаграммы.
*/

const SHEET_NAME = "Ответы";

function doPost(e) {
  const body = e && e.postData && e.postData.contents
    ? JSON.parse(e.postData.contents)
    : {};

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Дата", "Имя", "Присутствие", "Еда",
      "Алкоголь (предпочтение)", "Безалкогольные", "Пожелания"
    ]);
  }

  sheet.appendRow([
    new Date(),
    body.name || "",
    body.attendance || "",
    (body.food || []).join(", "),
    (body.alcohol || []).join(", "),
    (body.soft || []).join(", "),
    body.comment || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ok:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
