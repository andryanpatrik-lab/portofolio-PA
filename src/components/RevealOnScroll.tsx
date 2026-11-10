"use client";

import { useEffect } from "react";

/**
 * Marks [data-reveal] elements as visible once, when they scroll into view.
 * The hidden initial state and the transition live in globals.css (.reveal-ready).
 */
export function RevealOnScroll() {
  useEffect(() => {
    document.documentElement.classList.add("motion-active");
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
