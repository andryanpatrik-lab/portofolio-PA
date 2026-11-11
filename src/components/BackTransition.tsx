"use client";

import { useEffect } from "react";
import { startWhiteHole } from "@/lib/blackHole";

/**
 * Browser Back/Forward away from a case study (a light page): the navigation cannot be delayed, so the white curtain
 * is put up at once (it is barely visible over the light page) and hides the swap. The page navigated to lifts it.
 * Renders nothing.
 */
export function BackTransition() {
  useEffect(() => {
    const on = () => {
      if (!document.querySelector(".light-page")) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("cosmos-off")) return;
      startWhiteHole(null);
    };
    window.addEventListener("popstate", on);
    return () => window.removeEventListener("popstate", on);
  }, []);
  return null;
}
