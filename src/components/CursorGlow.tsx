"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, [role="button"], .project-card';

/**
 * Space-themed pointer: a soft golden glow trails the mouse and swells over links and cards; a small bright core
 * follows exactly. The native cursor stays visible. The two elements are hidden by CSS unless the device has a mouse
 * (hover + fine pointer), and no listeners are attached on the "off" quality tier (reduced motion, data saver). Only transform and opacity are animated, and the rAF loop
 * stops by itself when the pointer is still.
 */
export function CursorGlow() {
  const glow = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || document.documentElement.classList.contains("cosmos-off")) return;
    const g = glow.current;
    const c = core.current;
    if (!g || !c) return;
    let tx = -100;
    let ty = -100;
    let gx = -100;
    let gy = -100;
    let scale = 1;
    let target = 1;
    let raf = 0;
    let shown = false;
    let pressed = false;
    let hovering = false;

    const show = (v: boolean) => {
      shown = v;
      g.classList.toggle("is-on", v);
      c.classList.toggle("is-on", v);
    };
    const frame = () => {
      raf = 0;
      gx += (tx - gx) * 0.18;
      gy += (ty - gy) * 0.18;
      scale += (target - scale) * 0.2;
      g.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%) scale(${scale})`;
      c.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, -50%)`;
      if (Math.abs(tx - gx) > 0.1 || Math.abs(ty - gy) > 0.1 || Math.abs(target - scale) > 0.005) raf = requestAnimationFrame(frame);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const retarget = () => {
      target = pressed ? 0.85 : hovering ? 1.8 : 1;
      g.classList.toggle("is-hover", hovering);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return show(false);
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        gx = tx;
        gy = ty;
        show(true);
      }
      const next = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
      if (next !== hovering) {
        hovering = next;
        retarget();
      }
      request();
    };
    const onDown = () => {
      pressed = true;
      retarget();
      request();
    };
    const onUp = () => {
      pressed = false;
      retarget();
      request();
    };
    const onLeave = () => show(false);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={glow} aria-hidden="true" className="cursor-glow" />
      <div ref={core} aria-hidden="true" className="cursor-core" />
    </>
  );
}
