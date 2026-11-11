"use client";

import { scroll } from "motion";
import { useEffect } from "react";

const SEEN_KEY = "intro-seen";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (v: number, a: number, b: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Scroll-driven camera flight for the Intro section. One progress value (0 to 1) over the section's scroll range
 * drives a few decorative layers. Only transform and opacity are written, and scrolling itself stays native
 * (no wheel listener, no preventDefault). Renders nothing.
 */
export function IntroFlight() {
  useEffect(() => {
    const root = document.documentElement;
    const section = document.querySelector<HTMLElement>(".intro");
    if (!section || !root.classList.contains("intro-on")) return;
    const q = (name: string) => section.querySelector<HTMLElement>(`[data-intro="${name}"]`);
    const stick = q("stick");
    const stars = q("stars");
    const dustA = q("dust-a");
    const dustB = q("dust-b");
    const portal = q("portal");
    const copy = q("copy");
    const skip = q("skip");
    if (!stick || !stars || !dustA || !dustB || !portal || !copy || !skip) return;

    const markSeen = () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    };
    skip.addEventListener("click", markSeen);

    let finished = false;
    const apply = (p: number) => {
      // once the flight is over nothing changes any more: skip the style and storage writes for the rest of the page
      if (finished && p >= 0.98) return;
      stars.style.transform = `scale(${(1 + 2.4 * p * p).toFixed(3)})`;
      stars.style.opacity = String(1 - smooth(p, 0.8, 1));
      dustA.style.transform = `translate3d(0, ${(-35 * p).toFixed(2)}vh, 0) scale(${(1 + 0.4 * p).toFixed(3)})`;
      dustB.style.transform = `translate3d(0, ${(-70 * p).toFixed(2)}vh, 0) scale(${(1 + 0.6 * p).toFixed(3)})`;
      // the gate grows from small to larger than the screen (6x its base size is already past every screen edge): the camera passes through it
      const s = 0.2 * Math.exp(Math.log(30) * clamp(p / 0.88));
      portal.style.transform = `translate3d(-50%, -50%, 0) scale(${s.toFixed(3)})`;
      portal.style.opacity = String(clamp(p / 0.12) * (1 - smooth(p, 0.7, 0.95)));
      copy.style.transform = `translate3d(0, ${(-48 * clamp(p / 0.3)).toFixed(1)}px, 0)`;
      copy.style.opacity = String(1 - clamp(p / 0.28));
      stick.style.opacity = String(1 - smooth(p, 0.86, 1));
      // No header during the intro: it comes in (fade and slide, see globals.css) once the hero is reached.
      root.classList.toggle("intro-nav-hidden", p < 0.9);
      if (p >= 0.9) root.classList.add("intro-passed");
      const done = p >= 0.98;
      finished = done;
      skip.style.visibility = done ? "hidden" : "";
      if (done) markSeen();
    };
    apply(0);
    const stop = scroll((progress: number) => apply(clamp(progress)), { target: section, offset: ["start start", "end end"] });
    return () => {
      root.classList.remove("intro-nav-hidden");
      stop();
      skip.removeEventListener("click", markSeen);
    };
  }, []);
  return null;
}
