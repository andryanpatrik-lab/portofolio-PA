"use client";

import { scroll } from "motion";
import { animate } from "motion/mini";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll-linked text and section motion (skipped on the "off" tier):
 *  - [data-parallax="N"]: element drifts N px up and down across the viewport, full tier only (transform only).
 */
export function ScrollFx() {
  const pathname = usePathname();
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (cl.contains("cosmos-off")) return;
    const full = cl.contains("cosmos-full");
    const cleanups: (() => void)[] = [];
    if (full) {
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const d = parseFloat(el.dataset.parallax || "16");
        cleanups.push(
          scroll(animate(el, { transform: [`translateY(${d}px)`, `translateY(${-d}px)`] }, { ease: "linear" }), {
            target: el,
            offset: ["start end", "end start"],
          }),
        );
      });
    }
    return () => cleanups.forEach((c) => c());
  }, [pathname]);
  return null;
}
