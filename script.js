// Nicole lands: 12 Nov 2026, 2:45pm Bali (UTC+8) = 5:45pm Sydney (AEDT, UTC+11).
const TARGET = Date.parse("2026-11-12T14:45:00+08:00");

const daysEl = document.querySelector("#days");
const hoursEl = document.querySelector("#hours");
const minutesEl = document.querySelector("#minutes");
const secondsEl = document.querySelector("#seconds");
const countdownEl = document.querySelector("#countdown");
const arrivedEl = document.querySelector("#arrived");
const clockNoteEl = document.querySelector("#clock-note");
const lineEl = document.querySelector("#line");
const playButton = document.querySelector("#play");
const statusEl = document.querySelector("#status");

const audio = new Audio();
let currentDays = null;

function timeLeft(now) {
  const remaining = Math.ceil((TARGET - now.getTime()) / 1000);
  if (remaining <= 0) return null;
  return {
    days: Math.floor(remaining / 86400),
    hours: Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };
}

function phraseFor(days) {
  if (days === 1) return "1 day left, boss";
  return `${days} days left, boss`;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function render(now) {
  const left = timeLeft(now);

  if (!left) {
    countdownEl.hidden = true;
    arrivedEl.hidden = false;
    clockNoteEl.hidden = true;
    lineEl.textContent = "";
    playButton.hidden = true;
    return;
  }

  countdownEl.hidden = false;
  arrivedEl.hidden = true;
  clockNoteEl.hidden = false;
  playButton.hidden = false;

  const { days } = left;
  daysEl.textContent = String(days);
  hoursEl.textContent = pad(left.hours);
  minutesEl.textContent = pad(left.minutes);
  secondsEl.textContent = pad(left.seconds);
  lineEl.textContent = phraseFor(days);

  if (currentDays !== days) {
    currentDays = days;
    audio.src = `audio/${days}.m4a`;
    playButton.disabled = days > 30;
  }
}

playButton.addEventListener("click", () => {
  statusEl.textContent = "";
  audio.currentTime = 0;
  const playback = audio.play();
  if (!playback) return;

  playButton.disabled = true;
  playback
    .then(() => {
      playButton.textContent = "Playing…";
    })
    .catch(() => {
      playButton.disabled = false;
      playButton.textContent = "Play today's message";
      statusEl.textContent = "The message couldn't play. Try the button again.";
    });
});

audio.addEventListener("ended", () => {
  playButton.disabled = false;
  playButton.textContent = "Play today's message";
});

// Photo frame: tap to go to the next photo, with a "3 / 16" counter.
const PHOTO_COUNT = 16;
const frameEl = document.querySelector(".frame");
const slides = document.querySelectorAll(".slide");
const countEl = document.querySelector("#photo-count");
const photoUrl = (n) => `photos/${String(n + 1).padStart(2, "0")}.jpg?v=7`;
let photoIndex = 0;
let activeSlide = 0;
let hideTimer = null;

function showPhoto(index) {
  const url = photoUrl(index);
  const img = new Image();
  img.onload = () => {
    if (index !== photoIndex) return; // a newer tap has already moved on
    const prev = slides[activeSlide];
    const next = slides[1 - activeSlide];
    const first = !prev.classList.contains("show");

    // New photo goes on top and fades in; the old one stays fully visible
    // underneath until the fade is done, so the frame is never blank.
    clearTimeout(hideTimer);
    next.style.setProperty("--photo", `url("${url}")`);
    next.style.zIndex = "2";
    prev.style.zIndex = "1";
    next.style.transition = first ? "none" : "";
    next.classList.remove("show");
    void next.offsetWidth; // restart the fade
    next.classList.add("show");
    if (!first) hideTimer = setTimeout(() => prev.classList.remove("show"), 1400);

    activeSlide = 1 - activeSlide;
    new Image().src = photoUrl((index + 1) % PHOTO_COUNT); // preload the next one
  };
  img.src = url;
}

function nextPhoto() {
  photoIndex = (photoIndex + 1) % PHOTO_COUNT;
  if (countEl) countEl.textContent = `${photoIndex + 1} / ${PHOTO_COUNT}`;
  showPhoto(photoIndex);
}

if (frameEl && slides.length === 2) {
  showPhoto(photoIndex);
  frameEl.addEventListener("click", nextPhoto);
}

function tick() {
  render(new Date());
}

tick();
setInterval(tick, 1000);
