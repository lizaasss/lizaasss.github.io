const form = document.getElementById("rsvpForm");
const status = document.getElementById("formStatus");

// Если позже подключите Google Apps Script, вставьте сюда URL веб-приложения.
const GOOGLE_SCRIPT_URL = "";

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.food = [...form.querySelectorAll('input[name="food"]:checked')].map(x => x.value);
  data.alcohol = [...form.querySelectorAll('input[name="alcohol"]:checked')].map(x => x.value);
  data.soft = [...form.querySelectorAll('input[name="soft"]:checked')].map(x => x.value);

  status.textContent = "Отправляем ваш ответ…";

  if (!GOOGLE_SCRIPT_URL) {
    status.textContent = "Форма готова. После подключения таблицы ответы будут сохраняться автоматически.";
    return;
  }

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {"Content-Type": "text/plain;charset=utf-8"},
      body: JSON.stringify(data)
    });
    status.textContent = "Спасибо! Ваш ответ принят. Буду ждать встречи!";
    form.reset();
  } catch (err) {
    status.textContent = "Не удалось отправить ответ. Попробуйте ещё раз.";
  }
});

const petals = document.querySelector(".petals");
for (let i = 0; i < 18; i++) {
  const p = document.createElement("span");
  p.className = "petal";
  p.style.left = `${Math.random()*100}%`;
  p.style.animationDuration = `${9 + Math.random()*10}s`;
  p.style.animationDelay = `${-Math.random()*14}s`;
  p.style.setProperty("--drift", `${-80 + Math.random()*160}px`);
  p.style.transform = `rotate(${Math.random()*180}deg)`;
  petals.appendChild(p);
}

let audioCtx = null, timer = null, playing = false;
const btn = document.getElementById("musicBtn");
const notes = [261.63,329.63,392.00,329.63,293.66,349.23,440.00,349.23];
let step = 0;
function playNote(freq, when, duration=.9) {
  const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
  osc.type = "sine"; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(0.035, when+0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, when+duration);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(when); osc.stop(when+duration+0.05);
}
function schedule() {
  if (!playing) return;
  const now = audioCtx.currentTime;
  playNote(notes[step % notes.length], now, 1.7);
  if (step % 4 === 0) playNote(notes[(step+4) % notes.length]/2, now, 2.4);
  step++;
  timer = setTimeout(schedule, 1450);
}
btn.addEventListener("click", async () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") await audioCtx.resume();
  playing = !playing;
  btn.textContent = playing ? "Ⅱ Музыка" : "♪ Музыка";
  if (playing) schedule(); else clearTimeout(timer);
});
