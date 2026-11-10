/**
 * Runs inline in <head>, before first paint.
 * - "reveal-ready": section reveals are armed whenever motion is allowed.
 * - "hero-pending": the hero reveal will play (motion allowed and not yet played this session).
 * Text stays in the DOM either way; the classes only drive the initial hidden state in
 * globals.css, which also carries a CSS-only failsafe so content can never stay hidden.
 */
export const MOTION_INIT_SCRIPT = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("reveal-ready");if(!sessionStorage.getItem("hero-played"))d.classList.add("hero-pending")}catch(e){}})();`;

export const HERO_PENDING_CLASS = "hero-pending";
export const HERO_PLAYED_KEY = "hero-played";
