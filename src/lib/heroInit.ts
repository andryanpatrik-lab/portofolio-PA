/**
 * Runs inline in <head>, before first paint. Marks the page as "hero pending"
 * only when the reveal will actually play: motion is allowed and it has not
 * played yet in this browser session. Text stays in the DOM either way; the
 * class only drives the initial hidden state in globals.css.
 * The timeout is a failsafe so content can never stay hidden.
 */
export const HERO_INIT_SCRIPT = `(function(){try{var d=document.documentElement;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("hero-played"))return;d.classList.add("hero-pending");setTimeout(function(){d.classList.remove("hero-pending")},3000)}catch(e){}})();`;

export const HERO_PENDING_CLASS = "hero-pending";
export const HERO_PLAYED_KEY = "hero-played";
