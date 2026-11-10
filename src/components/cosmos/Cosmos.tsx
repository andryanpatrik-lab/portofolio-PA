"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { palettes, type CosmosKey } from "./palettes";
import type { Renderer } from "./webgl";

const KEYS = Object.keys(palettes) as CosmosKey[];
const TIER_KEY = "cosmos-tier";

/**
 * Space background, one per page load (it lives in the locale layout, so it survives route changes).
 * Tiers are set on <html> by the inline init script (src/lib/motionInit.ts):
 *  - full: WebGL nebula + stars on a fixed canvas;
 *  - lite / off: stacked CSS gradient layers (lite drifts slowly, off is static), crossfading by opacity only.
 * data-cosmos on a section picks the mood; the section under the viewport centre decides.
 */
export function Cosmos() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const refresh = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    let active: CosmosKey | "" = "";
    let renderer: Renderer | null = null;
    let ticking = false;

    const setTier = (tier: "full" | "lite" | "off") => {
      html.classList.remove("cosmos-full", "cosmos-lite", "cosmos-off");
      html.classList.add(`cosmos-${tier}`);
      try {
        sessionStorage.setItem(TIER_KEY, tier);
      } catch {}
    };
    const downgrade = (to: "lite" | "off") => {
      renderer?.destroy();
      renderer = null;
      setTier(to);
    };

    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      let key: CosmosKey | "" = "";
      let best = Infinity;
      document.querySelectorAll<HTMLElement>("[data-cosmos]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const dist = r.top <= vh / 2 && r.bottom >= vh / 2 ? 0 : Math.min(Math.abs(r.top - vh / 2), Math.abs(r.bottom - vh / 2));
        if (dist < best) {
          best = dist;
          key = el.dataset.cosmos as CosmosKey;
        }
      });
      if (!key || !KEYS.includes(key)) key = "void";
      renderer?.setScroll(window.scrollY / vh);
      if (key !== active) {
        active = key;
        if (wrap.current) wrap.current.dataset.active = key;
        renderer?.setTarget(palettes[key]);
      }
    };
    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    refresh.current = schedule;

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    let disposed = false;
    // The WebGL module is only fetched on the full tier (phones never download it).
    const startWebGL = async () => {
      if (!html.classList.contains("cosmos-full") || !canvas.current) return;
      const { createRenderer } = await import("./webgl");
      if (disposed || !canvas.current) return;
      renderer = createRenderer(canvas.current, {
        scale: 0.6,
        onSlow: (level) => {
          if (level === 1) renderer?.setScale(0.4);
          else downgrade("lite");
        },
        onLost: () => downgrade("lite"),
      });
      if (!renderer) return downgrade("lite");
      update();
      renderer.start();
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const startId = idle ? idle(startWebGL) : window.setTimeout(startWebGL, 400);

    const onVisibility = () => (document.hidden ? renderer?.stop() : renderer?.start());
    document.addEventListener("visibilitychange", onVisibility);
    update();

    return () => {
      disposed = true;
      if (!idle) window.clearTimeout(startId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer?.destroy();
    };
  }, []);

  // A route change swaps the sections on the page: re-evaluate which mood applies.
  useEffect(() => {
    const id = requestAnimationFrame(() => refresh.current());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <>
      <div ref={wrap} aria-hidden="true" data-active="void" className="cosmos-lite-wrap">
        <div className="cosmos-drift">
          {KEYS.map((k) => (
            <div key={k} className={`cosmos-p cosmos-p-${k}`} />
          ))}
          <div className="cosmos-stars" />
        </div>
      </div>
      <canvas ref={canvas} aria-hidden="true" className="cosmos-canvas" />
    </>
  );
}
