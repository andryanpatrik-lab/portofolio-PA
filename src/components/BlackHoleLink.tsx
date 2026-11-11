"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { startBlackHole } from "@/lib/blackHole";

/**
 * Forward link into a case study: plays the black-hole transition, then navigates. Falls back to a plain link (with the
 * regular morph/fade) for modified clicks, reduced motion, the "off" quality tier, or when the effect cannot run.
 */
export function BlackHoleLink({ href, onClick, ...props }: ComponentProps<typeof Link>) {
  const router = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (typeof href !== "string") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("cosmos-off")) return;
    if (startBlackHole(() => router.push(href))) e.preventDefault();
  };
  return <Link href={href} transitionTypes={["nav-forward"]} onClick={handle} {...props} />;
}
