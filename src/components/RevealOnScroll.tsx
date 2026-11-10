"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

// Number of RevealOnScroll mounts so far. Client-side navigations remount the component;
// reveals only play on the first one (so morph targets are never left hidden).
let mounts = 0;

/**
 * Marks [data-reveal] elements as visible once, when they scroll into view.
 * The hidden initial state and the transition live in globals.css (.reveal-ready).
 */
export function RevealOnScroll() {
  const counted = useRef(false);
  const first = useRef(true);

  useLayoutEffect(() => {
    if (!counted.current) {
      counted.current = true;
      first.current = mounts === 0;
      mounts++;
    }
    if (!first.current) document.documentElement.classList.remove("reveal-ready");
  }, []);

  useEffect(() => {
    if (!first.current) return;
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
