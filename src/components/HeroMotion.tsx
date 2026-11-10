"use client";

import { animate } from "motion/mini";
import { useEffect } from "react";
import { HERO_PENDING_CLASS, HERO_PLAYED_KEY } from "@/lib/motionInit";

const EASE = [0.23, 1, 0.32, 1] as const; // --ease-out

const q = (name: string) => document.querySelector<HTMLElement>(`[data-hero="${name}"]`);
const qa = (name: string) => Array.from(document.querySelectorAll<HTMLElement>(`[data-hero="${name}"]`));

/**
 * Hero Cinematic Reveal (BRIEF section 9). Only transform and opacity are animated.
 * The title rises via pure CSS (globals.css, .hero-pending) so it never waits for JavaScript (LCP);
 * this component sequences the remaining hero elements with Motion. Plays once per session; renders nothing.
 */
export function HeroMotion() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains(HERO_PENDING_CLASS)) return;
    root.classList.add("motion-active");
    let cancelled = false;
    let started = false;
    // Safety net: never leave the hero hidden if fonts or the sequence stall.
    const safety = window.setTimeout(() => {
      if (!started) root.classList.remove(HERO_PENDING_CLASS);
    }, 3000);

    const run = () => {
      if (cancelled) return;
      started = true;
      try {
        sessionStorage.setItem(HERO_PLAYED_KEY, "1");
      } catch {}
      const glow = q("glow");
      const label = q("label");
      const gold = q("gold");
      const nav = q("nav");
      const rest = qa("rest");
      const els = [glow, label, gold, nav, ...rest].filter(Boolean) as HTMLElement[];
      const anims = [
        glow && animate(glow, { opacity: [0, 1] }, { duration: 0.6, ease: EASE }),
        label && animate(label, { opacity: [0, 1], transform: ["translateY(12px)", "none"] }, { duration: 0.4, delay: 0.2, ease: EASE }),
        gold && animate(gold, { opacity: [0, 1] }, { duration: 0.5, delay: 1.0, ease: "easeOut" }),
        ...rest.map((el) => animate(el, { opacity: [0, 1] }, { duration: 0.4, delay: 1.2, ease: EASE })),
        nav && animate(nav, { opacity: [0, 1] }, { duration: 0.4, delay: 1.2, ease: EASE }),
      ].filter(Boolean) as ReturnType<typeof animate>[];
      Promise.all(anims.map((a) => a.finished)).then(() => {
        root.classList.remove(HERO_PENDING_CLASS);
        els.forEach((el) => {
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
        });
      });
    };

    if (document.fonts.status === "loaded") run();
    else document.fonts.ready.then(run, run);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}
