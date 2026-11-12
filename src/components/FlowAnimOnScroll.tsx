"use client";

import { useEffect } from "react";

/**
 * Plays the "Solusi" step diagram once, when it scrolls into view: nodes pop in, lines draw, labels fade up, then a soft ring
 * travels node to node. The hidden starting state is only applied after this mounts (class `fa-ready`), so without JS the
 * diagram is simply visible. All motion is CSS (transform and opacity only) and is gated in globals.css by
 * `prefers-reduced-motion` and the site's "animations off" switch. Unlike RevealOnScroll it also plays after client-side navigation.
 */
export function FlowAnimOnScroll() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-flow-anim]"));
    items.forEach((el) => el.classList.add("fa-ready"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.35 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
