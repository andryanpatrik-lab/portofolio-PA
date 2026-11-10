"use client";

import { scroll } from "motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { buildField, clear, makePuff, placeCanvas, renderAssemble, renderDissolve, renderPuff, type Field } from "@/lib/dust";

type Tier = "full" | "lite";
const TARGET: Record<Tier, number> = { full: 7000, lite: 2200 };

/**
 * Attaches the star-dust effect to one element.
 *  - data-dust="assemble": hidden until it scrolls into view, then dust flies in and forms the text.
 *  - data-dust="dissolve": the text stays visible; scrolling the section away blows it into dust (scroll-driven).
 * On the full tier, a few particles also drift off finished text from time to time.
 */
function attach(el: HTMLElement, tier: Tier): () => void {
  const mode = el.dataset.dust;
  const dpr = tier === "full" ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
  // The canvas only enters the DOM when dust is actually needed. Inserting wide absolute canvases at load made
  // mobile pages heavy (layout shift and long tasks), so nothing is created until the first scroll/reveal.
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "dust-canvas";
  const host = el.parentElement ?? el;
  let mounted = false;
  const mount = () => {
    if (mounted) return;
    mounted = true;
    host.classList.add("dust-host");
    placeCanvas(el, canvas);
    host.appendChild(canvas);
  };
  const ctx = canvas.getContext("2d");

  let field: Field | null = null;
  let disposed = false;
  let raf = 0;
  let puffTimer = 0;
  let visible = true;
  const timers: number[] = [];

  // Building only rasterises into the (detached) canvas; mount() is called when something is drawn.
  const ensureField = () => (field ??= buildField(el, canvas, dpr, TARGET[tier]));
  const cleanups: (() => void)[] = [];

  if (!ctx) {
    el.dataset.dustState = "done";
    canvas.remove();
    return () => {};
  }

  const visIO = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  visIO.observe(el);
  cleanups.push(() => visIO.disconnect());

  const schedulePuff = () => {
    if (tier !== "full" || disposed) return;
    puffTimer = window.setTimeout(doPuff, 5000 + 4000 * Math.random());
  };
  const doPuff = () => {
    if (disposed) return;
    const f = field;
    const idle = mode === "dissolve" ? el.style.opacity === "" : el.dataset.dustState === "done";
    if (!f || !visible || !idle || document.hidden) return schedulePuff();
    mount();
    const pf = makePuff(f);
    const t0 = performance.now();
    const frame = (now: number) => {
      if (disposed) return;
      if (renderPuff(ctx, f, pf, (now - t0) / 1000)) raf = requestAnimationFrame(frame);
      else {
        clear(ctx, f);
        schedulePuff();
      }
    };
    raf = requestAnimationFrame(frame);
  };

  if (mode === "assemble") {
    const finish = (f: Field | null) => {
      el.dataset.dustState = "done";
      canvas.style.transition = "opacity 600ms ease-out";
      canvas.style.opacity = "0";
      timers.push(
        window.setTimeout(() => {
          if (f && ctx) clear(ctx, f);
          canvas.style.transition = "none";
          canvas.style.opacity = "1";
          schedulePuff();
        }, 650),
      );
    };
    const start = () => {
      if (disposed) return;
      el.dataset.dustState = "running";
      const f = ensureField();
      if (!f) {
        el.dataset.dustState = "done";
        return;
      }
      mount();
      const t0 = performance.now();
      const frame = (now: number) => {
        if (disposed) return;
        const t = (now - t0) / 1000;
        if (renderAssemble(ctx, f, t) || t > 3.8) finish(f);
        else raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timers.push(window.setTimeout(() => el.dataset.dustState !== "done" && (el.dataset.dustState = "done"), 8000));
        document.fonts.ready.then(start, start);
      },
      { rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    cleanups.push(() => io.disconnect());
  } else {
    let p = 0;
    const heroBusy = () => document.documentElement.classList.contains("hero-pending");
    const apply = () => {
      raf = 0;
      if (disposed || heroBusy()) return;
      if (p <= 0.002) {
        el.style.opacity = "";
        if (field) clear(ctx, field);
        return;
      }
      const f = ensureField();
      if (!f) return;
      mount();
      el.style.opacity = String(1 - Math.min(p * 25, 1));
      renderDissolve(ctx, f, p, performance.now() / 1000);
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const section = el.closest("section") ?? el.parentElement ?? el;
    const stop = scroll(
      (progress: number) => {
        p = progress;
        request();
      },
      { target: section, offset: ["start start", "end start"] },
    );
    cleanups.push(stop);

    // Build the particle field in an idle moment once the hero has finished, so the first scroll has no hitch.
    const prebuild = window.setInterval(() => {
      if (heroBusy() || performance.now() < 5000) return;
      window.clearInterval(prebuild);
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
      const go = () => {
        if (!disposed) {
          ensureField();
          schedulePuff();
        }
      };
      if (idle) idle(go);
      else window.setTimeout(go, 200);
    }, 400);
    cleanups.push(() => window.clearInterval(prebuild));

    let lastW = el.getBoundingClientRect().width;
    const ro = new ResizeObserver(() => {
      const w = el.getBoundingClientRect().width;
      if (Math.abs(w - lastW) < 2) return;
      lastW = w;
      field = null;
      request();
    });
    ro.observe(el);
    cleanups.push(() => ro.disconnect());
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    window.clearTimeout(puffTimer);
    timers.forEach((t) => window.clearTimeout(t));
    cleanups.forEach((c) => c());
    el.style.opacity = "";
    el.dataset.dustState = "done";
    canvas.remove();
  };
}

/** Finds every [data-dust] element on the current page and attaches the effect (skipped on the "off" tier). */
export function DustController() {
  const pathname = usePathname();
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (cl.contains("cosmos-off")) return;
    const tier: Tier = cl.contains("cosmos-full") ? "full" : "lite";
    const cleanups = Array.from(document.querySelectorAll<HTMLElement>("[data-dust]")).map((el) => attach(el, tier));
    return () => cleanups.forEach((c) => c());
  }, [pathname]);
  return null;
}
