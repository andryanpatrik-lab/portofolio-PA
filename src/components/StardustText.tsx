"use client";

import { scroll } from "motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { buildField, clear, makePuff, placeCanvas, renderAssemble, renderDissolve, renderPuff, type Field } from "@/lib/dust";

type Tier = "full" | "lite";
// Scroll distance (px) over which the hero title evaporates once the hero has reached its resting place.
const DISSOLVE_DISTANCE = 240;
const TARGET: Record<Tier, number> = { full: 7000, lite: 2200 };

/**
 * Attaches the star-dust effect to one element.
 *  - data-dust="assemble": hidden until it scrolls into view, then dust flies in and forms the text.
 *  - data-dust="dissolve": the text stays visible; scrolling the section away blows it into dust (scroll-driven).
 * On the full tier, a few particles also drift off finished text from time to time.
 */
function attach(el: HTMLElement, tier: Tier, order: number | null): () => void {
  const mode = el.dataset.dust;
  // The hero title also assembles from dust when the page loads, then evaporates on scroll.
  const intro = el.dataset.dustIntro !== undefined;
  // Body-size text (paragraphs) is "small": quicker, lighter, and released after use. The hero intro is quick too.
  const small = parseFloat(getComputedStyle(el).fontSize) < 28;
  const paceFast = small || intro;
  // Very long text is shown as is.
  if (mode === "assemble" && (el.textContent ?? "").length > 450) {
    el.dataset.dustState = "done";
    return () => {};
  }
  // Text already on (or just below) the screen when the page loads starts at once, one element after another.
  const immediate = order !== null;
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
  const ensureField = () => (field ??= buildField(el, canvas, dpr, intro ? Math.round(TARGET[tier] * 0.7) : TARGET[tier], paceFast, intro || immediate));
  const cleanups: (() => void)[] = [];

  if (!ctx) {
    el.dataset.dustState = "done";
    canvas.remove();
    return () => {};
  }

  if (!small) {
    const visIO = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    visIO.observe(el);
    cleanups.push(() => visIO.disconnect());
  }

  const schedulePuff = () => {
    if (tier !== "full" || disposed || small) return;
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

  if (mode === "assemble" || intro) {
    const finish = (f: Field | null) => {
      el.dataset.dustState = "done";
      canvas.style.transition = "opacity 600ms ease-out";
      canvas.style.opacity = "0";
      timers.push(
        window.setTimeout(() => {
          if (f && ctx) clear(ctx, f);
          canvas.style.transition = "none";
          canvas.style.opacity = "1";
          if (small) {
            // Paragraphs are done for good: release the canvas and the particle data.
            canvas.remove();
            canvas.width = 0;
            field = null;
          } else schedulePuff();
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
    const begin = () => {
      timers.push(window.setTimeout(() => el.dataset.dustState !== "done" && (el.dataset.dustState = "done"), 8000));
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
      if (immediate) {
        // the hero title goes first, then the rest of the first screen with a small stagger (separate tasks);
        // first-screen text lands quickly (about 1 s) because visitors are waiting for it
        const delay = !order ? 0 : Math.min(60 + order * 90, 600);
        document.fonts.ready.then(() => timers.push(window.setTimeout(start, delay)), start);
      } else {
        document.fonts.ready.then(() => (idle ? idle(start, { timeout: 300 }) : start()), start);
      }
    };
    if (immediate) begin();
    else {
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          begin();
        },
        // start just before the text enters the screen so it is never seen un-dusted
        { rootMargin: "0px 0px 10% 0px" },
      );
      io.observe(el);
      cleanups.push(() => io.disconnect());
    }
  }
  if (mode === "dissolve") {
    let p = 0;
    // true once the title is fully dissolved and drawn that way: further scrolling needs no redraw
    let settled = false;
    // its own frame handle: the intro and puff loops use `raf`, and a stale value there must never block scrolling
    let dRaf = 0;
    cleanups.push(() => cancelAnimationFrame(dRaf));
    const heroBusy = () => document.documentElement.classList.contains("hero-pending");
    const apply = () => {
      dRaf = 0;
      if (disposed || heroBusy() || el.dataset.dustState === "pending" || el.dataset.dustState === "running") return;
      if (p <= 0.002) {
        el.style.opacity = "";
        if (field) clear(ctx, field);
        return;
      }
      if (p >= 1 && settled) return;
      const f = ensureField();
      if (!f) return;
      mount();
      settled = p >= 1;
      el.style.opacity = String(1 - Math.min(p * 8, 1));
      renderDissolve(ctx, f, p, performance.now() / 1000);
    };
    const request = () => {
      if (!dRaf) dRaf = requestAnimationFrame(apply);
    };
    // Distance is measured from where the hero section sits right under the header (its position without the
    // entry intro above it), so the title evaporates the same way whether or not the intro played.
    const sec = el.closest("section") ?? el;
    const stop = scroll(() => {
      const rest = document.querySelector("header")?.getBoundingClientRect().height ?? 80;
      p = Math.min(1, Math.max(0, (rest - sec.getBoundingClientRect().top) / DISSOLVE_DISTANCE));
      request();
    });
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
      settled = false;
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
    let order = 0;
    const cleanups = Array.from(document.querySelectorAll<HTMLElement>("[data-dust]")).map((el) => {
      const inView = el.getBoundingClientRect().top < window.innerHeight * 1.12;
      return attach(el, tier, inView ? order++ : null);
    });
    return () => cleanups.forEach((c) => c());
  }, [pathname]);
  return null;
}
