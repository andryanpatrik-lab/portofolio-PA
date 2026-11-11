/**
 * Star-dust text: the pixels of a heading become particles. Technique after the "sand text" on a reference site,
 * re-written here: rasterise the words to a 2D canvas, sample a grid, then fly/blow the samples around.
 * Pure canvas 2D; the real text always stays in the DOM (the canvas is decoration).
 */

export type Field = {
  count: number;
  /** canvas size in device pixels */
  w: number;
  h: number;
  dpr: number;
  size: number;
  tx: Float32Array;
  ty: Float32Array;
  sx: Float32Array;
  sy: Float32Array;
  delay: Float32Array;
  flight: Float32Array;
  seed: Float32Array;
  order: Float32Array;
  drift: Float32Array;
  rise: Float32Array;
  ci: Uint8Array;
  colors: [number, number, number][];
};

const PAD_X = 240;
const PAD_Y = 160;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function effectiveOpacity(from: HTMLElement | null, root: HTMLElement): number {
  // Opacity of the heading itself is ignored (it is hidden while the dust is shown); only inner layers count.
  let o = 1;
  for (let e = from; e && e !== root; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
  return o;
}

/**
 * Gives the canvas its final box around `el` (padding for flying particles). Done before the canvas enters the
 * DOM so inserting it never registers as a layout shift. The host is positioned and the canvas is a sibling of `el`
 * (fading the element must not fade the dust).
 */
export function placeCanvas(el: HTMLElement, canvas: HTMLCanvasElement) {
  const r = el.getBoundingClientRect();
  const { padL, padR } = pads(r);
  canvas.style.left = `${el.offsetLeft - padL}px`;
  canvas.style.top = `${el.offsetTop - PAD_Y}px`;
  canvas.style.width = `${r.width + padL + padR}px`;
  canvas.style.height = `${r.height + PAD_Y * 2}px`;
}

/** Side padding limited to the room left in the viewport, so the canvas can never widen the page (mobile). */
function pads(r: DOMRect) {
  return {
    padL: Math.max(0, Math.min(PAD_X, r.left)),
    padR: Math.max(0, Math.min(PAD_X, window.innerWidth - r.right)),
  };
}

/** Sizes the canvas around `el` (with padding for flying particles) and samples the element's visible words. */
export function buildField(el: HTMLElement, canvas: HTMLCanvasElement, dpr: number, target: number, fast = false, hero = false): Field | null {
  const rect = el.getBoundingClientRect();
  if (rect.width < 4 || rect.height < 4) return null;
  const { padL, padR } = pads(rect);
  const cssW = rect.width + padL + padR;
  const cssH = rect.height + PAD_Y * 2;
  placeCanvas(el, canvas);
  const w = Math.round(cssW * dpr);
  const h = Math.round(cssH * dpr);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.textBaseline = "alphabetic";

  const baseLeft = rect.left - padL;
  const baseTop = rect.top - PAD_Y;
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const text = node.textContent ?? "";
    if (!parent || !text.trim()) continue;
    if (effectiveOpacity(parent, el) < 0.5) continue;
    const cs = getComputedStyle(parent);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
    // The golden keyword is drawn in two layers (see Hero): its dust takes the colour of the gold layer.
    const gold = parent.classList.contains("accent-base") ? (parent.nextElementSibling as HTMLElement | null) : null;
    ctx.fillStyle = gold ? getComputedStyle(gold).color : cs.color;
    for (const m of text.matchAll(/\S+/g)) {
      range.setStart(node, m.index ?? 0);
      range.setEnd(node, (m.index ?? 0) + m[0].length);
      const r = range.getClientRects()[0];
      if (!r) continue;
      const mt = ctx.measureText(m[0]);
      const asc = mt.fontBoundingBoxAscent;
      const desc = mt.fontBoundingBoxDescent;
      const baseline = r.top + (r.height - (asc + desc)) / 2 + asc;
      ctx.fillText(m[0], r.left - baseLeft, baseline - baseTop);
    }
  }

  const data = ctx.getImageData(0, 0, w, h).data;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 128) opaque++;
  if (opaque < 20) return null;
  const step = Math.max(1, Math.ceil(Math.sqrt(opaque / target)));

  const xs: number[] = [];
  const ys: number[] = [];
  const colors: [number, number, number][] = [];
  const keyToIndex = new Map<number, number>();
  const cis: number[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const p = (y * w + x) * 4;
      if (data[p + 3] <= 128) continue;
      const key = ((data[p] >> 5) << 6) | ((data[p + 1] >> 5) << 3) | (data[p + 2] >> 5);
      let idx = keyToIndex.get(key);
      if (idx === undefined) {
        if (colors.length < 6) {
          idx = colors.length;
          colors.push([data[p], data[p + 1], data[p + 2]]);
          keyToIndex.set(key, idx);
        } else idx = 0;
      }
      // jitter inside the grid cell so the dust does not look like a regular dot matrix
      xs.push(x + (Math.random() - 0.5) * step);
      ys.push(y + (Math.random() - 0.5) * step);
      cis.push(idx);
    }
  }
  const count = xs.length;
  const f: Field = {
    count,
    w,
    h,
    dpr,
    size: Math.max(1.2, 1.25 * dpr),
    tx: Float32Array.from(xs),
    ty: Float32Array.from(ys),
    sx: new Float32Array(count),
    sy: new Float32Array(count),
    delay: new Float32Array(count),
    flight: new Float32Array(count),
    seed: new Float32Array(count),
    order: new Float32Array(count),
    drift: new Float32Array(count),
    rise: new Float32Array(count),
    ci: Uint8Array.from(cis),
    colors,
  };
  for (let i = 0; i < count; i++) {
    f.sx[i] = f.tx[i] - (80 + Math.random() * 280) * dpr;
    f.sy[i] = Math.min(h, Math.max(0, f.ty[i] + (Math.random() - 0.5) * 150 * dpr));
    // Paragraphs (fast) assemble in about 1.3 s so reading is not delayed; headings take their time.
    // The hero title lands in about 1 s (it is what visitors wait for), paragraphs in 1.3 s, headings in 2.6 s.
    f.delay[i] = (f.tx[i] / w) * (hero ? 0.28 : fast ? 0.45 : 0.9) + Math.random() * (hero ? 0.12 : fast ? 0.3 : 0.5);
    f.flight[i] = hero ? 0.45 + Math.random() * 0.35 : fast ? 0.6 + Math.random() * 0.4 : 1.1 + Math.random() * 0.8;
    f.seed[i] = Math.random() * Math.PI * 2;
    f.order[i] = (f.tx[i] / w) * 0.6 + Math.random() * 0.4;
    f.drift[i] = (180 + Math.random() * 700) * dpr;
    f.rise[i] = (30 + Math.random() * 280) * dpr;
  }
  return f;
}

// Alpha is bucketed (4 levels) so each colour needs only a few fillStyle changes per frame.
const LEVELS = 4;
function makeBuckets(f: Field) {
  const n = f.colors.length * LEVELS;
  const px: number[][] = Array.from({ length: n }, () => []);
  const styles = f.colors.flatMap(([r, g, b]) => Array.from({ length: LEVELS }, (_, l) => `rgba(${r},${g},${b},${((l + 1) / LEVELS).toFixed(2)})`));
  return { px, styles };
}
type Buckets = ReturnType<typeof makeBuckets>;
const bucketsCache = new WeakMap<Field, Buckets>();
function buckets(f: Field) {
  let b = bucketsCache.get(f);
  if (!b) bucketsCache.set(f, (b = makeBuckets(f)));
  for (const a of b.px) a.length = 0;
  return b;
}
function flush(ctx: CanvasRenderingContext2D, f: Field, b: Buckets) {
  ctx.clearRect(0, 0, f.w, f.h);
  const s = f.size;
  for (let k = 0; k < b.px.length; k++) {
    const a = b.px[k];
    if (!a.length) continue;
    ctx.fillStyle = b.styles[k];
    for (let i = 0; i < a.length; i += 2) ctx.fillRect(a[i], a[i + 1], s, s);
  }
}
const level = (alpha: number) => Math.min(LEVELS - 1, Math.floor(alpha * LEVELS));

/** Particles fly in from the left and settle on the letters. Returns true once every particle has landed. */
export function renderAssemble(ctx: CanvasRenderingContext2D, f: Field, t: number): boolean {
  const b = buckets(f);
  const amp = 22 * f.dpr;
  let done = true;
  for (let i = 0; i < f.count; i++) {
    const u = clamp01((t - f.delay[i]) / f.flight[i]);
    if (u < 1) done = false;
    if (u <= 0) continue;
    const e = 1 - (1 - u) ** 3;
    const r = 1 - e;
    const x = f.sx[i] + (f.tx[i] - f.sx[i]) * e + Math.sin(f.seed[i] + 3.1 * t) * r * amp;
    const y = f.sy[i] + (f.ty[i] - f.sy[i]) * e + Math.cos(f.seed[i] * 1.7 + 2.3 * t) * r * amp;
    b.px[f.ci[i] * LEVELS + (u >= 1 ? LEVELS - 1 : level(Math.min(4 * u, 0.99)))].push(x, y);
  }
  flush(ctx, f, b);
  return done;
}

/** Scroll-driven: progress 0 = text as is, 1 = every particle blown away to the right and up. */
export function renderDissolve(ctx: CanvasRenderingContext2D, f: Field, p: number, t: number) {
  const b = buckets(f);
  const wob = 14 * f.dpr;
  for (let i = 0; i < f.count; i++) {
    const s = clamp01((p - f.order[i] * 0.4) / 0.35);
    if (s >= 0.98) continue;
    const x = f.tx[i] + f.drift[i] * s ** 1.25 + Math.sin(f.seed[i] + 2.5 * t) * wob * s;
    const y = f.ty[i] - f.rise[i] * s ** 1.15 + Math.cos(f.seed[i] * 1.3 + 2 * t) * wob * s;
    b.px[f.ci[i] * LEVELS + level(1 - s ** 1.2)].push(x, y);
  }
  flush(ctx, f, b);
}

export type Puff = { idx: Uint32Array; vx: Float32Array; vy: Float32Array; delay: Float32Array; seed: Float32Array };

/** A small cloud of particles that drifts off the finished text now and then. */
export function makePuff(f: Field, n = 380): Puff {
  const k = Math.min(n, f.count);
  const idx = new Uint32Array(k);
  const vx = new Float32Array(k);
  const vy = new Float32Array(k);
  const delay = new Float32Array(k);
  const seed = new Float32Array(k);
  for (let i = 0; i < k; i++) {
    idx[i] = Math.floor(Math.random() * f.count);
    vx[i] = (90 + Math.random() * 220) * f.dpr;
    vy[i] = (Math.random() - 0.6) * 50 * f.dpr;
    delay[i] = Math.random() * 0.5;
    seed[i] = Math.random() * Math.PI * 2;
  }
  return { idx, vx, vy, delay, seed };
}

/** Returns false when the puff has fully faded. */
export function renderPuff(ctx: CanvasRenderingContext2D, f: Field, pf: Puff, t: number): boolean {
  const b = buckets(f);
  let alive = false;
  for (let k = 0; k < pf.idx.length; k++) {
    const u = clamp01((t - pf.delay[k]) / 1.6);
    if (u >= 1) continue;
    alive = true;
    if (u <= 0) continue;
    const i = pf.idx[k];
    const e = u * u;
    const x = f.tx[i] + pf.vx[k] * e + 6 * Math.sin(f.seed[i] + 4 * t) * f.dpr * u;
    const y = f.ty[i] + pf.vy[k] * e - 10 * f.dpr * Math.sin(u * Math.PI);
    b.px[f.ci[i] * LEVELS + level((1 - u) ** 1.5 * 0.9)].push(x, y);
  }
  flush(ctx, f, b);
  return alive;
}

export function clear(ctx: CanvasRenderingContext2D, f: Field) {
  ctx.clearRect(0, 0, f.w, f.h);
}
