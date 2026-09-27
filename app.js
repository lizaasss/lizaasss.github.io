(() => {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpEbMBGlPXNuhvFAPsnXsHgWJR9YChv0wkaAyUB60p9mzm61KC2TgnC7LSh2QaJudD/exec';

  // ---------- Музыка ----------
  const audio = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const musicLabel = musicToggle?.querySelector('.music-label');
  const musicIcon = musicToggle?.querySelector('.music-icon');

  function setMusicUI(isPlaying) {
    if (!musicToggle) return;
    if (musicLabel) musicLabel.textContent = isPlaying ? 'Выключить музыку' : 'Включить музыку';
    if (musicIcon) musicIcon.textContent = isPlaying ? '🔇' : '🔊';
    musicToggle.setAttribute('aria-label', isPlaying ? 'Выключить музыку' : 'Включить музыку');
  }

  async function tryPlayMusic() {
    if (!audio) return false;
    try {
      await audio.play();
      setMusicUI(true);
      return true;
    } catch (_) {
      setMusicUI(false);
      return false;
    }
  }

  if (audio && musicToggle) {
    setMusicUI(false);
    tryPlayMusic();

    const startAfterInteraction = () => {
      if (audio.paused) tryPlayMusic();
      document.removeEventListener('pointerdown', startAfterInteraction);
      document.removeEventListener('keydown', startAfterInteraction);
    };

    document.addEventListener('pointerdown', startAfterInteraction, { passive: true });
    document.addEventListener('keydown', startAfterInteraction, { passive: true });

    musicToggle.addEventListener('click', async (event) => {
      event.stopPropagation();

      if (audio.paused) {
        await tryPlayMusic();
      } else {
        audio.pause();
        setMusicUI(false);
      }
    });

    audio.addEventListener('play', () => setMusicUI(true));
    audio.addEventListener('pause', () => setMusicUI(false));
  }

  // ---------- Падающие лепестки ----------
  const petals = document.querySelector('.petals');

  if (petals && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const count = window.innerWidth < 600 ? 13 : 24;

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';

      const size = 6 + Math.random() * 7;
      const left = Math.random() * 100;
      const duration = 18 + Math.random() * 18;
      const delay = -Math.random() * duration;
      const opacity = 0.18 + Math.random() * 0.28;

      petal.style.left = `${left}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.55}px`;
      petal.style.opacity = opacity;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${delay}s`;
      petal.style.setProperty('--drift1', `${-70 + Math.random() * 140}px`);
      petal.style.setProperty('--drift2', `${-110 + Math.random() * 220}px`);
      petal.style.setProperty('--drift3', `${-90 + Math.random() * 180}px`);
      petal.style.setProperty('--drift4', `${-120 + Math.random() * 240}px`);

      petals.appendChild(petal);
    }
  }

  // ---------- Плавное появление блоков ----------
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('visible'));
  }

  // ---------- Отправка анкеты в Google Таблицу ----------
  const form = document.getElementById('rsvpForm');
  const status = document.getElementById('formStatus');
  const submitButton = form?.querySelector('.submit-btn');

  if (form && status) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = form.elements.name.value.trim();
      const attendance = form.elements.attendance?.value || '';

      const food = Array.from(
        form.querySelectorAll('input[name="food"]:checked')
      ).map(input => input.value);

      // В HTML формы поле называется "soft", а Code.gs ожидает "drinks".
      const drinks = Array.from(
        form.querySelectorAll('input[name="soft"]:checked')
      ).map(input => input.value);

      // В HTML формы поле называется "comment", а Code.gs ожидает "comments".
      const comments = form.elements.comment?.value.trim() || '';

      if (!name || !attendance) {
        status.textContent = 'Пожалуйста, заполните имя и выберите вариант присутствия.';
        return;
      }

      const payload = {
        name,
        attendance,
        food,
        drinks,
        comments
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Отправляем…';
      }

      status.textContent = 'Сохраняем ваш ответ…';

      try {
        // text/plain + no-cors позволяет GitHub Pages отправлять запрос
        // в Google Apps Script без CORS preflight.
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        status.textContent = name
          ? `Спасибо, ${name}! Ваш ответ сохранён.`
          : 'Спасибо! Ваш ответ сохранён.';

        form.reset();
      } catch (error) {
        console.error('Ошибка отправки анкеты:', error);
        status.textContent =
          'Не удалось отправить анкету. Пожалуйста, попробуйте ещё раз.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Отправить анкету';
        }
      }
    });
  }
})();
