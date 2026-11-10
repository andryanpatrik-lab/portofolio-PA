"use client";

import { useEffect, useLayoutEffect } from "react";

// True after the first mount. Client-side navigations remount this component; reveals only play on the first load.
let mountedOnce = false;

/**
 * Marks [data-reveal] elements as visible once, when they scroll into view.
 * The hidden initial state and the transition live in globals.css (.reveal-ready).
 */
export function RevealOnScroll() {
  useLayoutEffect(() => {
    if (mountedOnce) document.documentElement.classList.remove("reveal-ready");
    const t = window.setTimeout(() => {
      mountedOnce = true;
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (mountedOnce) return;
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
