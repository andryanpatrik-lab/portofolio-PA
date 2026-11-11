"use client";

import { useEffect, useRef } from "react";

type Mote = { x: number; y: number; z: number; s: number; vy: number; sw: number; ph: number; a: number; tw: number };

/**
 * Golden dust drifting up behind the light (case study) pages: a fixed 2D canvas with a few dozen soft motes, a slow sway,
 * a little scroll parallax and a twinkle. Full quality tier only; capped at 30 fps, paused when the tab is hidden, and it
 * switches itself off if frames turn out slow. Renders only the canvas; the page content is untouched.
 */
export function LightMotes() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !document.documentElement.classList.contains("cosmos-full")) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    };
    resize();

    // one soft golden sprite, drawn at different sizes
    const S = 48;
    const sprite = document.createElement("canvas");
    sprite.width = S;
    sprite.height = S;
    const sc = sprite.getContext("2d");
    if (!sc) return;
    const g = sc.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(176, 120, 8, 1)");
    g.addColorStop(0.35, "rgba(212, 160, 23, 0.7)");
    g.addColorStop(1, "rgba(212, 160, 23, 0)");
    sc.fillStyle = g;
    sc.fillRect(0, 0, S, S);

    const count = Math.round(Math.min(80, Math.max(36, W / 18)));
    const motes: Mote[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.5 + Math.random() * 0.5,
      s: 14 + Math.random() * 22,
      vy: 0.012 + Math.random() * 0.02,
      sw: 10 + Math.random() * 30,
      ph: Math.random() * Math.PI * 2,
      a: 0.6 + Math.random() * 0.4,
      tw: 0.5 + Math.random() * 1.5,
    }));

    let raf = 0;
    let last = 0;
    let frames = 0;
    let sum = 0;
    let stopped = false;
    const t0 = performance.now();
    const stop = () => {
      stopped = true;
      cancelAnimationFrame(raf);
      canvas.style.display = "none";
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      if (dt < 33) return;
      last = now;
      // slow device: give up quietly instead of dragging the page down
      frames++;
      if (frames > 20) sum += dt;
      if (frames === 110) {
        if (sum / 90 > 45) return stop();
        frames = 20;
        sum = 0;
      }
      const t = (now - t0) / 1000;
      const sy = window.scrollY;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (const m of motes) {
        const py = (((m.y - t * m.vy * m.z) % 1) + 1) % 1; // rises, wraps at the top
        const yy = (((py * H - sy * 0.12 * m.z) % H) + H) % H; // parallax against the scroll
        const xx = m.x * W + Math.sin(t * 0.4 + m.ph) * m.sw;
        ctx.globalAlpha = m.a * (0.6 + 0.4 * Math.sin(t * m.tw + m.ph));
        const sz = m.s * m.z;
        ctx.drawImage(sprite, xx - sz / 2, yy - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    };
    const onVisibility = () => {
      if (stopped) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="light-motes" />;
}
