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

    const introOn = root.classList.contains("intro-on");
    let io: IntersectionObserver | null = null;
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
      const play = (list: (ReturnType<typeof animate> | null)[]) => list.filter(Boolean) as ReturnType<typeof animate>[];
      // The nav fades in at load; with the entry intro the rest of the hero waits until it comes into view.
      const navAnim = nav ? animate(nav, { opacity: [0, 1] }, { duration: 0.4, delay: introOn ? 0.3 : 1.2, ease: EASE }) : null;
      const playHero = () =>
        play([
          glow && animate(glow, { opacity: [0, 1] }, { duration: 0.6, ease: EASE }),
          label && animate(label, { opacity: [0, 1], transform: ["translateY(12px)", "none"] }, { duration: 0.4, delay: 0.2, ease: EASE }),
          gold && animate(gold, { opacity: [0, 1] }, { duration: 0.5, delay: 1.0, ease: "easeOut" }),
          ...rest.map((el) => animate(el, { opacity: [0, 1] }, { duration: 0.4, delay: 1.2, ease: EASE })),
        ]);
      const finish = (anims: ReturnType<typeof animate>[]) =>
        Promise.all([...anims, ...(navAnim ? [navAnim] : [])].map((a) => a.finished)).then(() => {
          root.classList.remove(HERO_PENDING_CLASS);
          els.forEach((el) => {
            el.style.removeProperty("opacity");
            el.style.removeProperty("transform");
          });
        });
      const hero = document.getElementById("hero");
      if (introOn && hero) {
        io = new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return;
            io?.disconnect();
            finish(playHero());
          },
          { rootMargin: "0px 0px -30% 0px" },
        );
        io.observe(hero);
      } else finish(playHero());
    };

    if (document.fonts.status === "loaded") run();
    else document.fonts.ready.then(run, run);

    return () => {
      cancelled = true;
      io?.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}
