/**
 * Black-hole page transition (entering a case study). Plain elements and the Web Animations API, not View Transitions:
 * the old page is pulled into a growing hole, a black curtain covers the route swap, and the curtain lifts once the new
 * page has mounted (arriveBlackHole). Only transform and opacity are animated.
 */
const EASE_IN = "cubic-bezier(0.55, 0, 0.9, 0.45)";
let navigating = false;
let failsafe = 0;
let pageAnims: Animation[] = [];
let cancelled = false;

const el = (sel: string) => document.querySelector<HTMLElement>(sel);

/** Plays the pull-in, then calls `go` (the route change) once the screen is black. Returns false when it cannot run. */
export function startBlackHole(go: () => void): boolean {
  if (navigating) return false;
  const root = document.documentElement;
  const curtain = el(".bh-curtain");
  const disc = el(".bh-portal");
  if (!curtain || !disc || typeof curtain.animate !== "function") return false;
  navigating = true;
  cancelled = false;
  // browser Back/Forward while the pull-in plays: drop the pending route change instead of jumping to it afterwards
  const onPop = () => {
    cancelled = true;
    arriveBlackHole();
  };
  window.addEventListener("popstate", onPop, { once: true });
  root.classList.add("bh-nav");
  // the screen is about to go black: the background shader has nothing to show and its GPU queue must not compete with the swap
  window.dispatchEvent(new Event("bh-start"));
  pageAnims = Array.from(document.querySelectorAll<HTMLElement>("header, main, footer")).map((node) =>
    node.animate(
      [
        { transform: "scale(1) rotate(0deg)", opacity: 1 },
        { transform: "scale(1.3) rotate(3deg)", opacity: 0.3 },
      ],
      { duration: 560, easing: EASE_IN, fill: "forwards" },
    ),
  );
  const grow = disc.animate(
    [
      { transform: "scale(0.04)", opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.2 },
      { transform: "scale(1)", opacity: 1, offset: 1 },
    ],
    { duration: 580, easing: EASE_IN, fill: "forwards" },
  );
  curtain.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 200, easing: "ease-in", fill: "forwards" });
  grow.finished.then(
    () => {
      window.removeEventListener("popstate", onPop);
      if (cancelled) return;
      go();
      // never leave the screen black if the new page does not report in
      failsafe = window.setTimeout(arriveBlackHole, 5000);
    },
    () => arriveBlackHole(),
  );
  return true;
}

/** Called by the page that was navigated to: lifts the curtain and cleans up. Harmless when nothing is running. */
export function arriveBlackHole() {
  if (!navigating) return;
  navigating = false;
  window.clearTimeout(failsafe);
  const root = document.documentElement;
  window.dispatchEvent(new Event("bh-end"));
  const curtain = el(".bh-curtain");
  const disc = el(".bh-portal");
  pageAnims.forEach((a) => a.cancel());
  pageAnims = [];
  if (!curtain || !disc) return root.classList.remove("bh-nav");
  const lift = curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 80, easing: "ease-in-out", fill: "forwards" });
  disc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 40, easing: "ease-out", fill: "forwards" });
  const done = () => {
    curtain.getAnimations().forEach((a) => a.cancel());
    disc.getAnimations().forEach((a) => a.cancel());
    root.classList.remove("bh-nav");
  };
  lift.finished.then(done, done);
}
