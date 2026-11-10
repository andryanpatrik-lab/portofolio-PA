"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { HERO_PENDING_CLASS, HERO_PLAYED_KEY } from "@/lib/heroInit";

gsap.registerPlugin(useGSAP, SplitText);

const EASE_OUT = "power4.out"; // closest GSAP built-in to --ease-out (cubic-bezier(0.23, 1, 0.32, 1))

const q = (name: string) => document.querySelector<HTMLElement>(`[data-hero="${name}"]`);
const qa = (name: string) => Array.from(document.querySelectorAll<HTMLElement>(`[data-hero="${name}"]`));

/**
 * Hero Cinematic Reveal (BRIEF section 9). Only transform and opacity are animated.
 * Plays once per session; renders nothing. Elements are targeted via data-hero attributes
 * so the hero itself stays a server component.
 */
export function HeroMotion() {
  useGSAP((_, contextSafe) => {
    const root = document.documentElement;
    if (!root.classList.contains(HERO_PENDING_CLASS)) return;

    let cancelled = false;

    const run = contextSafe!(() => {
      if (cancelled) return;
      const title = q("title");
      const glow = q("glow");
      const label = q("label");
      const gold = q("gold");
      const rest = qa("rest");
      const nav = q("nav");
      if (!title) {
        root.classList.remove(HERO_PENDING_CLASS);
        return;
      }

      try {
        sessionStorage.setItem(HERO_PLAYED_KEY, "1");
      } catch {}

      const split = SplitText.create(title, { type: "lines" });
      const all = [title, glow, label, gold, nav, ...rest].filter(Boolean) as HTMLElement[];

      const tl = gsap.timeline({
        defaults: { ease: EASE_OUT },
        onComplete: () => {
          root.classList.remove(HERO_PENDING_CLASS);
          gsap.set(all, { clearProps: "opacity,transform" });
          split.revert();
        },
      });

      // The title container is hidden by CSS until now; its lines carry the animation.
      gsap.set(title, { opacity: 1 });
      if (glow) tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
      if (label) tl.fromTo(label, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, 0.2);
      tl.fromTo(split.lines, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.4);
      if (gold) tl.fromTo(gold, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 1.0);
      if (rest.length) tl.fromTo(rest, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.2);
      if (nav) tl.fromTo(nav, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.2);
    });

    document.fonts.ready.then(run, run);

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
