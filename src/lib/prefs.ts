/**
 * Visitor display preferences (the "Tampilan" panel): switch every animation off, and pick one flat colour for the whole site.
 * Stored in localStorage and applied before paint by the head script (src/lib/motionInit.ts), so there is no flash.
 * Components react to changes through window events instead of reloading.
 */
export type Theme = "" | "dark" | "grey" | "cream";

export const MOTION_KEY = "pref-motion";
export const THEME_KEY = "pref-theme";
export const THEMES = ["dark", "grey", "cream"] as const;

const root = () => document.documentElement;

export const getTheme = (): Theme => THEMES.find((t) => root().classList.contains(`theme-${t}`)) ?? "";
export const isMotionOff = () => root().classList.contains("motion-off");
export const systemWantsReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** True while a flat colour theme is active (no space background, no intro). */
export const isFlatTheme = () => getTheme() !== "";

export function setTheme(t: Theme) {
  const cl = root().classList;
  THEMES.forEach((x) => cl.remove(`theme-${x}`));
  if (t) cl.add(`theme-${t}`);
  try {
    if (t) localStorage.setItem(THEME_KEY, t);
    else localStorage.removeItem(THEME_KEY);
  } catch {}
  window.dispatchEvent(new Event("pref-theme"));
}

/** Stops every animation at once: classes first (CSS and head-script states), then listeners tear their effects down. */
export function setMotionOff() {
  const cl = root().classList;
  cl.add("motion-off");
  cl.remove("cosmos-full", "cosmos-lite", "dust-ready", "reveal-ready", "hero-pending");
  cl.add("cosmos-off");
  // the intro is removed by IntroFlight (it also keeps the scroll position stable); on pages without it, just drop the class
  if (!document.querySelector(".intro")) cl.remove("intro-on");
  try {
    localStorage.setItem(MOTION_KEY, "off");
  } catch {}
  window.dispatchEvent(new Event("pref-motion-off"));
  // animations started through the Web Animations API (hero reveal, counters, transitions) ignore CSS: jump them to their end
  document.getAnimations().forEach((a) => {
    try {
      a.finish();
    } catch {
      a.cancel();
    }
  });
}

/** Turning animation back on restarts every effect cleanly: reload the page. */
export function setMotionOn() {
  try {
    localStorage.removeItem(MOTION_KEY);
    // the quality tier was set to "off" for this session when animations were switched off: start from the device's own tier
    sessionStorage.removeItem("cosmos-tier");
  } catch {}
  window.location.reload();
}
