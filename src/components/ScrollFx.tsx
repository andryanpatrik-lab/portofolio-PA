"use client";

import { scroll } from "motion";
import { animate } from "motion/mini";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const EASE = [0.23, 1, 0.32, 1] as const;

/** Splits a paragraph into words and reveals them one by one when it scrolls into view. */
function splitReveal(el: HTMLElement): () => void {
  const text = el.textContent ?? "";
  el.textContent = "";
  const spans: HTMLSpanElement[] = [];
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      el.append(document.createTextNode(part));
      continue;
    }
    const s = document.createElement("span");
    s.textContent = part;
    s.style.display = "inline-block";
    s.style.opacity = "0";
    el.append(s);
    spans.push(s);
  }
  el.dataset.splitReady = "true";
  const io = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      spans.forEach((s, i) => {
        animate(s, { opacity: [0, 1], transform: ["translateY(10px)", "none"] }, { duration: 0.5, delay: Math.min(i * 0.022, 0.9), ease: EASE }).finished.then(() => {
          s.style.opacity = "";
          s.style.display = "";
        });
        s.style.opacity = "";
      });
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Scroll-linked text and section motion (skipped on the "off" tier):
 *  - [data-split]: paragraph appears word by word;
 *  - [data-parallax="N"]: element drifts N px up and down across the viewport, full tier only (transform only).
 */
export function ScrollFx() {
  const pathname = usePathname();
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (cl.contains("cosmos-off")) return;
    const full = cl.contains("cosmos-full");
    const cleanups: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => cleanups.push(splitReveal(el)));
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
