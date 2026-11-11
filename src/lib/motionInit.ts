/**
 * Runs inline in <head>, before first paint.
 * - "cosmos-full | cosmos-lite | cosmos-off": quality tier of the space background.
 *     off  = reduced motion or data saver; lite = phones, tablets, weak devices (CSS only);
 *     full = capable desktops (WebGL). A tier lowered earlier this session (FPS watchdog) is kept.
 * - "dust-ready": star-dust text and word reveals are armed (any tier except off).
 * - "no-vt": the browser lacks the View Transitions API, so pages crossfade via CSS instead.
 * - "reveal-ready": section reveals are armed whenever motion is allowed.
 * - "intro-on": the home page plays the scroll-driven entry (M10): motion allowed, not seen this session, no #hash.
 * - "hero-pending": the hero reveal will play (motion allowed and not yet played this session).
 * Text stays in the DOM either way; the classes only drive the initial hidden state in
 * globals.css, which also carries a CSS-only failsafe so content can never stay hidden.
 */
export const MOTION_INIT_SCRIPT = `(function(){try{var d=document.documentElement,m=window.matchMedia;if(!document.startViewTransition)d.classList.add("no-vt");var rm=m("(prefers-reduced-motion: reduce)").matches,sd=navigator.connection&&navigator.connection.saveData,r={off:0,lite:1,full:2},t="full";if(rm||sd)t="off";else if(!m("(pointer: fine)").matches||window.innerWidth<1024||(navigator.hardwareConcurrency||4)<4)t="lite";try{var s=sessionStorage.getItem("cosmos-tier");if(s&&r[s]<r[t])t=s}catch(e){}d.classList.add("cosmos-"+t);if(t!=="off")d.classList.add("dust-ready");if(rm)return;d.classList.add("reveal-ready");if(t!=="off"&&!location.hash&&/^\\/(id|en)\\/?$/.test(location.pathname)&&!sessionStorage.getItem("intro-seen"))d.classList.add("intro-on");if(!sessionStorage.getItem("hero-played"))d.classList.add("hero-pending")}catch(e){}})();`;

export const HERO_PENDING_CLASS = "hero-pending";
export const HERO_PLAYED_KEY = "hero-played";
