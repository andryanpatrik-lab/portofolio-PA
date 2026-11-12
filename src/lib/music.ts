/**
 * Background music (M17), driven outside React so it survives page changes and is shared by the player and the display panel.
 * Browsers only allow sound after a user gesture, so playback starts at the first click, tap or key press (never on scroll),
 * fades in, loops, pauses while the tab is hidden, and stays off for visitors who switched it off (localStorage "pref-music").
 */
const KEY = "pref-music";
const VOLUME = 0.35;
const FADE_IN = 2500;
const START_EVENTS = ["pointerup", "click", "keydown", "touchend"] as const;

let src = "";
let audio: HTMLAudioElement | null = null;
let on = false;
let raf = 0;
let fadeTimer = 0;
let armed = false;
let firstGesture: ((e: Event) => void) | null = null;

const emit = () => window.dispatchEvent(new Event("music-change"));

export const musicAvailable = () => !!src;
export const isMusicOn = () => on;

function fadeTo(target: number, ms: number, done?: () => void) {
  const a = audio;
  if (!a) return;
  cancelAnimationFrame(raf);
  window.clearTimeout(fadeTimer);
  const from = a.volume;
  const t0 = performance.now();
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    a.volume = Math.max(0, Math.min(1, target));
    done?.();
  };
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    a.volume = Math.max(0, Math.min(1, from + (target - from) * k));
    if (k < 1) raf = requestAnimationFrame(step);
    else finish();
  };
  raf = requestAnimationFrame(step);
  // a busy or throttled page may starve requestAnimationFrame: the fade must still end on time
  fadeTimer = window.setTimeout(finish, ms + 150);
}

async function start(): Promise<boolean> {
  if (!src) return false;
  if (!audio) {
    audio = new Audio(src);
    audio.loop = true;
    audio.preload = "none"; // play() loads it when (and only when) playback is allowed
    audio.volume = 0;
  }
  try {
    await audio.play();
  } catch {
    // not allowed yet (no real gesture): stay off and wait for the next one
    on = false;
    emit();
    return false;
  }
  on = true;
  try {
    localStorage.removeItem(KEY);
  } catch {}
  fadeTo(VOLUME, FADE_IN);
  emit();
  return true;
}

function stop() {
  on = false;
  try {
    localStorage.setItem(KEY, "off");
  } catch {}
  fadeTo(0, 400, () => audio?.pause());
  emit();
}

/** The music button in the display panel. */
export function toggleMusic() {
  if (on) stop();
  else void start();
}

function disarm() {
  if (firstGesture) START_EVENTS.forEach((n) => document.removeEventListener(n, firstGesture as EventListener, true));
  firstGesture = null;
  armed = false;
}

function arm() {
  if (armed) return;
  armed = true;
  firstGesture = (e: Event) => {
    // the music button handles its own click
    if ((e.target as Element | null)?.closest?.("[data-music-toggle]")) return;
    disarm();
    void start().then((ok) => {
      if (!ok) arm();
    });
  };
  START_EVENTS.forEach((n) => document.addEventListener(n, firstGesture as EventListener, true));
}

/**
 * A quiet attempt right after the page has loaded: it only succeeds where the browser allows sound without a gesture
 * (returning visitors with high engagement in Chrome, sites the visitor allowed). Everyone else keeps the first-gesture start.
 */
function tryAutoplay() {
  void start().then((ok) => {
    if (ok) disarm();
  });
}

let initialised = false;

/** Call once with the music file path; an empty path leaves the feature off. */
export function initMusic(file: string) {
  if (initialised || !file) return;
  initialised = true;
  src = file;
  emit();
  let optedOut = false;
  try {
    optedOut = localStorage.getItem(KEY) === "off";
  } catch {}
  if (!optedOut) {
    arm();
    const attempt = () => window.setTimeout(tryAutoplay, 1500);
    if (document.readyState === "complete") attempt();
    else window.addEventListener("load", attempt, { once: true });
  }
  document.addEventListener("visibilitychange", () => {
    if (!audio || !on) return;
    if (document.hidden) audio.pause();
    else void audio.play().catch(() => {});
  });
}
