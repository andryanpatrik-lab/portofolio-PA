"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { holePos } from "./hole";
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
  const hole = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const refresh = useRef<() => void>(() => {});
  const setLight = useRef<(on: boolean) => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    let active: CosmosKey | "" = "";
    let renderer: Renderer | null = null;
    let ticking = false;
    let holeSize = 0;
    // Light pages (case studies) cover the background completely: the shader is paused there.
    let light = false;

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
      // Lite tier: the CSS black hole follows the same path as the shader one (transform only).
      if (hole.current && html.classList.contains("cosmos-lite")) {
        const w = window.innerWidth;
        const h = holePos(window.scrollY / vh, w / vh);
        const size = Math.round(h.r * vh * 4.2);
        if (size !== holeSize) {
          holeSize = size;
          hole.current.style.width = hole.current.style.height = `${size}px`;
        }
        hole.current.style.transform = `translate3d(${Math.round(w / 2 + h.x * vh - size / 2)}px, ${Math.round(vh / 2 - h.y * vh - size / 2)}px, 0)`;
      }
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
      if (!light) renderer.start();
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const startId = idle ? idle(startWebGL) : window.setTimeout(startWebGL, 400);

    const onVisibility = () => (document.hidden || light ? renderer?.stop() : renderer?.start());
    setLight.current = (on) => {
      light = on;
      if (on) renderer?.stop();
      else if (!document.hidden) renderer?.start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    // the black-hole page transition pauses the shader while it runs (see src/lib/blackHole.ts)
    const onBhStart = () => setLight.current(true);
    const onBhEnd = () => setLight.current(!!document.querySelector(".light-page"));
    window.addEventListener("bh-start", onBhStart);
    window.addEventListener("bh-end", onBhEnd);
    update();

    return () => {
      disposed = true;
      if (!idle) window.clearTimeout(startId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("bh-start", onBhStart);
      window.removeEventListener("bh-end", onBhEnd);
      renderer?.destroy();
    };
  }, []);

  // A route change swaps the sections on the page: re-evaluate which mood applies.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setLight.current(!!document.querySelector(".light-page"));
      refresh.current();
    });
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
          <div className="cosmos-stars cosmos-stars-b" />
        </div>
        <div className="cosmos-meteors">
          <span />
          <span />
          <span />
        </div>
        <div ref={hole} className="cosmos-hole">
          <span className="cosmos-hole-ring" />
          <span className="cosmos-hole-core" />
        </div>
      </div>
      <canvas ref={canvas} aria-hidden="true" className="cosmos-canvas" />
    </>
  );
}
