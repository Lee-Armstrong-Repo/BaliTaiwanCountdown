const TIMEZONE = "Australia/Sydney";
const TARGET_DATE = "2026-11-12";

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

function calendarDaysLeft(now) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const start = Date.parse(`${today}T00:00:00Z`);
  const end = Date.parse(`${TARGET_DATE}T00:00:00Z`);
  return Math.round((end - start) / 86400000);
}

function sydneyClock(now) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const value = (type) => Number(parts.find((part) => part.type === type).value);
  return {
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function timeUntilSydneyMidnight(now) {
  const { hour, minute, second } = sydneyClock(now);
  const elapsed = hour * 3600 + minute * 60 + second;
  const remaining = elapsed === 0 ? 86400 : 86400 - elapsed;
  return {
    hours: Math.floor(remaining / 3600),
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
  const days = calendarDaysLeft(now);

  if (days < 0) {
    countdownEl.hidden = true;
    arrivedEl.hidden = false;
    clockNoteEl.hidden = true;
    lineEl.textContent = "";
    playButton.hidden = true;
    return;
  }

  countdownEl.hidden = false;
  arrivedEl.hidden = true;
  clockNoteEl.hidden = days === 0;
  playButton.hidden = false;

  const untilMidnight = days === 0
    ? { hours: 0, minutes: 0, seconds: 0 }
    : timeUntilSydneyMidnight(now);

  daysEl.textContent = String(days);
  hoursEl.textContent = pad(untilMidnight.hours);
  minutesEl.textContent = pad(untilMidnight.minutes);
  secondsEl.textContent = pad(untilMidnight.seconds);
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

function tick() {
  render(new Date());
}

tick();
setInterval(tick, 1000);
