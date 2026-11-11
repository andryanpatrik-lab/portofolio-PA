/**
 * Page transitions with a hole (src/components/BlackHoleLink.tsx, BackLink.tsx, BackTransition.tsx). Plain elements and the Web
 * Animations API, not View Transitions (their paint order showed the new page before the effect):
 *  - "black": entering a case study. The old page is pulled into a growing black hole, a black curtain covers the route swap.
 *  - "white": leaving it. The light page shrinks, a ring of light spreads out until the screen is white, then the dark home
 *    page comes out of the light.
 * The curtain lifts once the new page has mounted (arriveBlackHole). Only transform and opacity are animated.
 */
type Kind = "black" | "white";

const EASE_IN = "cubic-bezier(0.55, 0, 0.9, 0.45)";
let navigating = false;
let kind: Kind = "black";
let failsafe = 0;
let pageAnims: Animation[] = [];
let cancelled = false;

const el = (sel: string) => document.querySelector<HTMLElement>(sel);

/**
 * Plays the lead-in, then calls `go` (the route change) once the screen is covered. With `go === null` the route change is
 * already happening (browser Back): the curtain just covers it at once. Returns false when it cannot run.
 */
function begin(k: Kind, go: (() => void) | null): boolean {
  if (navigating) return false;
  const root = document.documentElement;
  const curtain = el(".bh-curtain");
  const disc = el(".bh-portal");
  if (!curtain || !disc || typeof curtain.animate !== "function") return false;
  navigating = true;
  kind = k;
  cancelled = false;
  const instant = go === null;
  // browser Back/Forward while the lead-in plays: drop the pending route change instead of jumping to it afterwards
  const onPop = () => {
    cancelled = true;
    arriveBlackHole();
  };
  if (!instant) window.addEventListener("popstate", onPop, { once: true });
  root.classList.add("bh-nav");
  if (k === "white") root.classList.add("bh-white");
  // the screen is about to be covered: the background shader has nothing to show and its GPU queue must not compete with the swap
  window.dispatchEvent(new Event("bh-start"));

  if (!instant) {
    const frames =
      k === "black"
        ? [
            { transform: "scale(1) rotate(0deg)", opacity: 1 },
            { transform: "scale(1.3) rotate(3deg)", opacity: 0.3 },
          ]
        : [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(0.8)", opacity: 0.15 },
          ];
    pageAnims = Array.from(document.querySelectorAll<HTMLElement>("header, main, footer")).map((node) =>
      node.animate(frames, { duration: 560, easing: EASE_IN, fill: "forwards" }),
    );
  }
  const grow = disc.animate(
    [
      { transform: "scale(0.04)", opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.2 },
      { transform: "scale(1)", opacity: 1, offset: 1 },
    ],
    { duration: instant ? 520 : 580, easing: EASE_IN, fill: "forwards" },
  );
  if (instant) {
    // set synchronously: the route swap can be committed before the next frame, so the curtain must already be opaque then
    curtain.style.opacity = "1";
  } else {
    curtain.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, delay: 200, easing: "ease-in", fill: "forwards" });
  }
  if (instant) {
    failsafe = window.setTimeout(arriveBlackHole, 5000);
    return true;
  }
  grow.finished.then(
    () => {
      window.removeEventListener("popstate", onPop);
      if (cancelled) return;
      go();
      // never leave the screen covered if the new page does not report in
      failsafe = window.setTimeout(arriveBlackHole, 5000);
    },
    () => arriveBlackHole(),
  );
  return true;
}

/** Entering a case study: calls `go` once the screen is black. */
export const startBlackHole = (go: () => void) => begin("black", go);

/** Leaving it: `go` is the route change, or null when the browser is already navigating (Back button). */
export const startWhiteHole = (go: (() => void) | null) => begin("white", go);

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
  if (!curtain || !disc) {
    root.classList.remove("bh-nav", "bh-white");
    return;
  }
  // the dark page comes out of the light: it settles in from slightly enlarged
  if (kind === "white") {
    document.querySelectorAll<HTMLElement>("header, main, footer").forEach((node) =>
      node.animate(
        [
          { transform: "scale(1.06)", opacity: 0.3 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 700, delay: 60, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
      ),
    );
  }
  const lift = curtain.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 80, easing: "ease-in-out", fill: "both" });
  disc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 40, easing: "ease-out", fill: "both" });
  const done = () => {
    curtain.getAnimations().forEach((a) => a.cancel());
    disc.getAnimations().forEach((a) => a.cancel());
    curtain.style.opacity = "";
    root.classList.remove("bh-nav", "bh-white");
  };
  lift.finished.then(done, done);
}
