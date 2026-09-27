(() => {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpEbMBGlPXNuhvFAPsnXsHgWJR9YChv0wkaAyUB60p9mzm61KC2TgnC7LSh2QaJudD/exec';

  // Music: try autoplay first, then unlock after the first click/key press.
  const audio = document.getElementById('bgMusic');
  const toggle = document.getElementById('musicToggle');
  const icon = toggle?.querySelector('.music-icon');
  const label = toggle?.querySelector('.music-label');

  function musicUI(playing) {
    if (!toggle) return;
    icon.textContent = playing ? '🔇' : '🔊';
    label.textContent = playing ? 'Выключить музыку' : 'Включить музыку';
    toggle.setAttribute('aria-label', playing ? 'Выключить музыку' : 'Включить музыку');
  }

  async function playMusic() {
    if (!audio) return false;
    try {
      await audio.play();
      musicUI(true);
      return true;
    } catch {
      musicUI(false);
      return false;
    }
  }

  if (audio && toggle) {
    musicUI(!audio.paused);
    playMusic();

    const unlock = async (event) => {
      if (event.target.closest?.('#musicToggle')) return;
      if (await playMusic()) {
        document.removeEventListener('pointerdown', unlock);
        document.removeEventListener('keydown', unlock);
      }
    };
    document.addEventListener('pointerdown', unlock, {passive:true});
    document.addEventListener('keydown', unlock, {passive:true});

    toggle.addEventListener('click', async (event) => {
      event.stopPropagation();
      if (audio.paused) await playMusic();
      else {
        audio.pause();
        musicUI(false);
      }
    });

    audio.addEventListener('play', () => musicUI(true));
    audio.addEventListener('pause', () => musicUI(false));
  }

  // Falling petals
  const petalLayer = document.querySelector('.petals');
  if (petalLayer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const count = window.innerWidth < 600 ? 14 : 26;

    for (let i = 0; i < count; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      const size = 6 + Math.random() * 7;
      const duration = 18 + Math.random() * 19;

      petal.style.left = `${Math.random() * 100}%`;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.55}px`;
      petal.style.opacity = `${0.18 + Math.random() * 0.26}`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${-Math.random() * duration}s`;

      petal.style.setProperty('--d1', `${-70 + Math.random() * 140}px`);
      petal.style.setProperty('--d2', `${-110 + Math.random() * 220}px`);
      petal.style.setProperty('--d3', `${-90 + Math.random() * 180}px`);
      petal.style.setProperty('--d4', `${-120 + Math.random() * 240}px`);

      petalLayer.appendChild(petal);
    }
  }

  // Reveal animation
  const reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.12});
    reveal.forEach(el => observer.observe(el));
  } else {
    reveal.forEach(el => el.classList.add('visible'));
  }

  // RSVP -> Google Sheets
  const form = document.getElementById('rsvpForm');
  const status = document.getElementById('formStatus');
  const button = form?.querySelector('.submit-button');

  if (form && status) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = form.elements.name.value.trim();
      const attendance = form.elements.attendance?.value || '';
      const food = [...form.querySelectorAll('input[name="food"]:checked')].map(i => i.value);
      const drinks = [...form.querySelectorAll('input[name="soft"]:checked')].map(i => i.value);
      const water = [...form.querySelectorAll('input[name="water"]:checked')]
  .map(i => i.value);
      const comments = form.elements.comment?.value.trim() || '';

      if (!name || !attendance) {
        status.textContent = 'Пожалуйста, заполните имя и выберите вариант присутствия.';
        return;
      }

      button.disabled = true;
      button.textContent = 'Отправляем…';
      status.textContent = 'Сохраняем ваш ответ…';

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {'Content-Type':'text/plain;charset=utf-8'},
         body: JSON.stringify({
  name,
  attendance,
  food,
  drinks,
  water,
  comments
})

        status.textContent = `Спасибо, ${name}! Ваш ответ сохранён.`;
        form.reset();
      } catch (error) {
        console.error(error);
        status.textContent = 'Не удалось отправить анкету. Пожалуйста, попробуйте ещё раз.';
      } finally {
        button.disabled = false;
        button.textContent = '♡  Отправить анкету';
      }
    });
  }
})();
