(() => {
  const audio = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const musicLabel = musicToggle?.querySelector('.music-label');
  const musicIcon = musicToggle?.querySelector('.music-icon');

  function setMusicUI(isPlaying) {
    if (!musicToggle) return;
    musicLabel.textContent = isPlaying ? 'Выключить музыку' : 'Включить музыку';
    musicIcon.textContent = isPlaying ? '🔇' : '🔊';
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

    // Browsers may block unmuted autoplay. The first guest interaction can start it.
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

  // Soft, slow rose petals with random trajectories.
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

  // Gentle reveal animations on scroll.
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

  // Local confirmation for the static GitHub Pages version.
  // To collect responses, connect this form to a Google Apps Script endpoint later.
  const form = document.getElementById('rsvpForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = form.elements.name.value.trim();
      status.textContent = name
        ? `Спасибо, ${name}! Анкета заполнена.`
        : 'Спасибо! Анкета заполнена.';
      form.reset();
    });
  }
})();
