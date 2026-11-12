/**
 * Interactive workflow viewer (M29): an SVG graph that can be panned and zoomed, with stage regions, a legend, and
 * scenario playback (a pulse travels along a route, with a caption for each step).
 *
 * Motion policy (approved by Patrik): nothing plays on its own. Playback starts only when the visitor presses Play, and it
 * is switched off completely when the "animations off" preference or `prefers-reduced-motion` is active (the slider and the
 * arrow keys still step through a route). The pulse and the camera are driven through SVG attributes, which is an
 * exception to the "DOM animates only transform and opacity" rule, recorded in BRIEF.md.
 */

export type FlowKind = "trigger" | "code" | "decision" | "data" | "http" | "merge" | "wait" | "stop" | "message" | "subflow";

export type FlowStructure = {
  nodes: { kind: FlowKind; sub?: string; x: number; y: number; stage: number }[];
  edges: { from: number; to: number; out: number }[];
  stages: { id: string; hue: number; box: [number, number, number, number] }[];
  scenarios: { id: string; path: number[] }[];
};

export type FlowTexts = {
  title: string;
  desc: string;
  /** Where the flow comes from (illustration, early version, ...). Shown under the title. */
  badge?: string;
  steps: number;
  stageCount: number;
  names: string[];
  stages: { short: string; title: string; desc: string }[];
  scenarios: { title: string; desc: string }[];
};

export type ViewerLabels = {
  diagram: string;
  yes: string;
  no: string;
  scenarios: string;
  step: string;
  stepOf: string;
  zoomOut: string;
  zoomIn: string;
  fit: string;
  fitLabel: string;
  play: string;
  pause: string;
  replay: string;
  follow: string;
  motionOff: string;
  steps: string;
  kinds: Record<FlowKind, string>;
};

export type ViewerOptions = {
  /** When true the mouse wheel zooms without a modifier key (full-screen page). Embedded viewers need Ctrl or Cmd. */
  captureWheel?: boolean;
};

type Cam = { x: number; y: number; k: number };
type Seg = { halo: SVGPathElement; core: SVGPathElement; base: SVGPathElement; len: number };

const SVG_NS = "http://www.w3.org/2000/svg";

// Simple stroke icons (24x24 viewBox) drawn for the step kinds.
const ICON: Record<FlowKind, string> = {
  trigger: "M13 2 4 14h7l-1 8 9-12h-7z",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14",
  decision: "M12 3v6m0 0-6 6v6m6-12 6 6v6",
  data: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6",
  http: "M4 8h13l-3-3M20 16H7l3 3",
  merge: "M6 4l6 8 6-8M12 12v8",
  wait: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  stop: "M7 7l10 10M17 7 7 17",
  message: "M4 5h16v11H9l-5 4z",
  subflow: "M4 6h7v5H4zM13 13h7v5h-7zM11 8.5h2.5a2 2 0 0 1 2 2V13",
};

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const key of Object.keys(attrs)) node.setAttribute(key, String(attrs[key]));
  parent?.appendChild(node);
  return node;
}

function htmlEl<K extends keyof HTMLElementTagNameMap>(tag: K, cls = "", text = "", parent?: Element): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text) node.textContent = text;
  parent?.appendChild(node);
  return node;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Splits a label into at most two short lines for the SVG text. */
function wrapLabel(text: string, max = 17): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > 2) {
    lines.length = 2;
    lines[1] = lines[1].replace(/.{0,2}$/, "…");
  }
  return lines;
}

export class FlowViewer {
  private root: HTMLElement;
  private data: FlowStructure;
  private text: FlowTexts;
  private labels: ViewerLabels;
  private opts: ViewerOptions;

  private svg!: SVGSVGElement;
  private world!: SVGGElement;
  private gEdges!: SVGGElement;
  private gHalo!: SVGGElement;
  private gCore!: SVGGElement;
  private gHead!: SVGGElement;
  private gNodes!: SVGGElement;
  private gPulse!: SVGGElement;
  private headPath!: SVGPathElement;
  private pulseGlow!: SVGCircleElement;
  private pulseDot!: SVGCircleElement;
  private nodeEls = new Map<number, SVGGElement>();
  private edgeEls = new Map<string, SVGPathElement>();
  private stageBtns: HTMLButtonElement[] = [];
  private headEl!: HTMLElement;
  private navEl!: HTMLElement;
  private bottomEl!: HTMLElement;
  private ui!: {
    chips: HTMLButtonElement[];
    play: HTMLButtonElement;
    slider: HTMLInputElement;
    speed: HTMLButtonElement[];
    follow: HTMLButtonElement;
    capStep: HTMLElement;
    capTitle: HTMLElement;
    capSub: HTMLElement;
    capFoot: HTMLElement;
    tip: HTMLElement;
    note: HTMLElement;
  };

  private cam: Cam = { x: 0, y: 0, k: 0.1 };
  private W = 0;
  private H = 0;
  private fitK = 0.1;
  private tween: { from: Cam; to: Cam; t: number; dur: number } | null = null;
  private follow = true;
  private scenarioIndex = 0;
  private segs: Seg[] = [];
  private pos = 0;
  private playing = false;
  private speed = 2;
  private shown = 0;
  private curNode = -1;
  private raf = 0;
  private last = 0;
  private userMoved = false;
  private scenTop = 78;
  private bottomH = 130;
  private timers: number[] = [];
  private ro?: ResizeObserver;
  private reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  private onMotionChange = () => {
    if (this.motionOff()) this.pause();
    this.syncPlayUi();
  };

  constructor(root: HTMLElement, data: FlowStructure, text: FlowTexts, labels: ViewerLabels, opts: ViewerOptions = {}) {
    this.root = root;
    this.data = data;
    this.text = text;
    this.labels = labels;
    this.opts = opts;
    this.root.classList.add("fv");
    this.root.tabIndex = 0;
    this.build();
    this.bind();
    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(this.root);
    this.ro.observe(this.bottomEl);
    this.measure(true);
    this.selectScenario(0);
    this.syncSpeedUi();
    window.addEventListener("pref-motion-off", this.onMotionChange);
    this.reducedMq.addEventListener("change", this.onMotionChange);
  }

  destroy() {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.timers.forEach((t) => window.clearTimeout(t));
    this.ro?.disconnect();
    window.removeEventListener("pref-motion-off", this.onMotionChange);
    this.reducedMq.removeEventListener("change", this.onMotionChange);
    this.root.replaceChildren();
    this.root.classList.remove("fv", "is-playing", "has-route", "is-dragging");
  }

  /** True when the visitor asked for less motion (system setting or the site's "animations off" switch). */
  private motionOff() {
    return this.reducedMq.matches || document.documentElement.classList.contains("motion-off");
  }

  private nameOf(i: number) {
    return this.text.names[i] ?? "";
  }

  private build() {
    const { text, labels } = this;
    this.root.replaceChildren();
    this.svg = svgEl("svg", { class: "fv-svg", role: "img", "aria-label": `${labels.diagram}: ${text.title}` });
    this.root.appendChild(this.svg);
    const defs = svgEl("defs", {}, this.svg);
    const marker = svgEl("marker", { id: "fv-arrow", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: "userSpaceOnUse", orient: "auto" }, defs);
    svgEl("path", { d: "M0 1 10 5 0 9z", class: "fv-arrow" }, marker);
    this.world = svgEl("g", { class: "fv-world" }, this.svg);
    const gStages = svgEl("g", { class: "fv-stages-bg" }, this.world);
    this.gEdges = svgEl("g", { class: "fv-edges" }, this.world);
    this.gHalo = svgEl("g", { class: "fv-halo" }, this.world);
    this.gCore = svgEl("g", { class: "fv-core" }, this.world);
    this.gHead = svgEl("g", { class: "fv-head" }, this.world);
    this.gNodes = svgEl("g", { class: "fv-nodes" }, this.world);
    this.gPulse = svgEl("g", { class: "fv-pulse" }, this.world);

    this.data.stages.forEach((s, i) => {
      const [x1, y1, x2, y2] = s.box;
      svgEl("rect", { x: x1, y: y1, width: x2 - x1, height: y2 - y1, rx: 28, class: "fv-stage", style: `--hue:${s.hue}`, "data-stage": i }, gStages);
    });

    const nodes = this.data.nodes;
    this.data.edges.forEach((e) => {
      const a = nodes[e.from];
      const b = nodes[e.to];
      if (!a || !b) return;
      const path = svgEl("path", { d: this.curve(a, b), class: "fv-edge", "marker-end": "url(#fv-arrow)" }, this.gEdges);
      const key = `${e.from}>${e.to}`;
      if (!this.edgeEls.has(key)) this.edgeEls.set(key, path);
      if (a.sub === "if") {
        const label = svgEl("text", { class: "fv-branch", "text-anchor": "middle" }, this.gEdges);
        label.textContent = e.out === 0 ? labels.yes : labels.no;
        queueMicrotask(() => {
          const len = path.getTotalLength();
          const pt = path.getPointAtLength(Math.min(len * 0.3, 90));
          label.setAttribute("x", String(pt.x));
          label.setAttribute("y", String(pt.y - 7));
        });
      }
    });
    nodes.forEach((n, i) => this.gNodes.appendChild(this.makeNode(n, i)));

    this.headPath = svgEl("path", { class: "fv-headpath" }, this.gHead);
    this.pulseGlow = svgEl("circle", { class: "fv-pulse-glow", r: 0 }, this.gPulse);
    this.pulseDot = svgEl("circle", { class: "fv-pulse-dot", r: 0 }, this.gPulse);

    const stageLabels = htmlEl("div", "fv-stage-labels", "", this.root);
    this.data.stages.forEach((s, i) => {
      const btn = htmlEl("button", "fv-stage-label", text.stages[i]?.short ?? "", stageLabels);
      btn.type = "button";
      btn.style.setProperty("--hue", String(s.hue));
      btn.title = text.stages[i]?.desc ?? "";
      btn.addEventListener("click", () => this.flyToStage(i));
      this.stageBtns.push(btn);
    });

    const head = htmlEl("header", "fv-head-bar", "", this.root);
    const left = htmlEl("div", "fv-head-left", "", head);
    const titleBox = htmlEl("div", "fv-titlebox", "", left);
    htmlEl("h2", "", text.title, titleBox);
    htmlEl("p", "", labels.steps.replace("{n}", String(text.steps)).replace("{s}", String(text.stageCount)), titleBox);
    if (text.badge) htmlEl("p", "fv-badge", text.badge, titleBox);
    const tools = htmlEl("div", "fv-tools", "", head);
    const zoom = htmlEl("div", "fv-seg fv-zoom", "", tools);
    const out = htmlEl("button", "", "−", zoom);
    out.type = "button";
    out.setAttribute("aria-label", labels.zoomOut);
    const fit = htmlEl("button", "", labels.fit, zoom);
    fit.type = "button";
    fit.title = labels.fitLabel;
    const inn = htmlEl("button", "", "+", zoom);
    inn.type = "button";
    inn.setAttribute("aria-label", labels.zoomIn);
    out.onclick = () => this.zoomBy(1 / 1.5);
    inn.onclick = () => this.zoomBy(1.5);
    fit.onclick = () => {
      this.userMoved = false;
      this.flyToFit();
    };

    const nav = htmlEl("nav", "fv-scenarios", "", this.root);
    nav.setAttribute("aria-label", labels.scenarios);
    this.headEl = head;
    this.navEl = nav;
    const chips = this.text.scenarios.map((s, i) => {
      const chip = htmlEl("button", "fv-chip", s.title, nav);
      chip.type = "button";
      chip.onclick = () => this.selectScenario(i);
      return chip;
    });

    const bottom = htmlEl("div", "fv-bottom", "", this.root);
    this.bottomEl = bottom;
    const caption = htmlEl("section", "fv-caption", "", bottom);
    const capStep = htmlEl("div", "fv-cap-step", "", caption);
    const capTitle = htmlEl("div", "fv-cap-title", "", caption);
    const capSub = htmlEl("div", "fv-cap-sub", "", caption);
    const capFoot = htmlEl("div", "fv-cap-foot", "", caption);
    const note = htmlEl("div", "fv-note", labels.motionOff, caption);
    note.hidden = true;

    const transport = htmlEl("footer", "fv-transport", "", bottom);
    const play = htmlEl("button", "fv-play", "", transport);
    play.type = "button";
    play.onclick = () => (this.playing ? this.pause() : this.play());
    const slider = htmlEl("input", "fv-slider", "", transport);
    slider.type = "range";
    slider.min = "0";
    slider.step = "1";
    slider.value = "0";
    slider.setAttribute("aria-label", labels.step);
    slider.oninput = () => {
      this.pause();
      this.pos = Number(slider.value);
      this.renderPos();
      this.centerOnPulse(true);
    };
    const speedSeg = htmlEl("div", "fv-seg fv-speed", "", transport);
    const speed = [1, 2, 4].map((s) => {
      const b = htmlEl("button", "", `${s}×`, speedSeg);
      b.type = "button";
      b.onclick = () => {
        this.speed = s;
        this.syncSpeedUi();
      };
      return b;
    });
    const follow = htmlEl("button", "fv-follow", labels.follow, transport);
    follow.type = "button";
    follow.onclick = () => {
      this.follow = !this.follow;
      this.userMoved = !this.follow;
      this.syncFollowUi();
      if (this.follow) this.ensureLoop();
    };

    const legend = htmlEl("div", "fv-legend", "", this.root);
    (["trigger", "decision", "data", "http", "message", "subflow", "stop"] as FlowKind[]).forEach((k) => {
      const item = htmlEl("span", `k-${k}`, "", legend);
      const s = svgEl("svg", { viewBox: "-14 -14 28 28", "aria-hidden": "true" }, item);
      this.shape(k, 11, s);
      item.appendChild(document.createTextNode(labels.kinds[k]));
    });

    const tip = htmlEl("div", "fv-tip", "", this.root);
    tip.hidden = true;
    tip.setAttribute("role", "tooltip");
    this.ui = { chips, play, slider, speed, follow, capStep, capTitle, capSub, capFoot, tip, note };
  }

  private shape(kind: FlowKind, r: number, parent: Element) {
    if (kind === "decision") svgEl("polygon", { class: "shape", points: `0,${-r} ${r},0 0,${r} ${-r},0` }, parent);
    else if (kind === "stop") svgEl("circle", { class: "shape", r }, parent);
    else svgEl("rect", { class: "shape", x: -r, y: -r, width: r * 2, height: r * 2, rx: r * 0.38 }, parent);
  }

  private makeNode(n: FlowStructure["nodes"][number], id: number) {
    const g = svgEl("g", { class: `fv-node k-${n.kind}`, transform: `translate(${n.x} ${n.y})`, "data-id": id, style: `--hue:${this.data.stages[n.stage]?.hue ?? 205}` });
    svgEl("circle", { class: "fv-node-halo", r: 54 }, g);
    const r = n.kind === "trigger" ? 32 : n.kind === "decision" ? 36 : n.kind === "stop" ? 27 : 28;
    if (n.kind === "decision") svgEl("polygon", { class: "shape", points: `0,${-r} ${r},0 0,${r} ${-r},0` }, g);
    else if (n.kind === "stop") svgEl("circle", { class: "shape", r }, g);
    else svgEl("rect", { class: "shape", x: -r, y: -r, width: r * 2, height: r * 2, rx: n.kind === "trigger" ? 22 : 14 }, g);
    svgEl("path", { class: "icon", d: ICON[n.kind], transform: "translate(-13 -13) scale(1.08)" }, g);
    const label = svgEl("text", { class: "fv-label", y: r + 22, "text-anchor": "middle" }, g);
    wrapLabel(this.nameOf(id)).forEach((line, i) => {
      const t = svgEl("tspan", { x: 0, dy: i === 0 ? 0 : 17 }, label);
      t.textContent = line;
    });
    this.nodeEls.set(id, g);
    return g;
  }

  private curve(a: { x: number; y: number }, b: { x: number; y: number }) {
    const x1 = a.x + 30;
    const y1 = a.y;
    const x2 = b.x - 32;
    const y2 = b.y;
    const dx = x2 - x1;
    if (dx > 50) {
      const r = Math.max(40, dx * 0.5);
      return `M${x1} ${y1}C${x1 + r} ${y1} ${x2 - r} ${y2} ${x2} ${y2}`;
    }
    return `M${x1} ${y1}C${x1 + 90} ${y1} ${x2 - 90} ${y2} ${x2} ${y2}`;
  }

  private bind() {
    const svg = this.svg;
    const pointers = new Map<number, { x: number; y: number }>();
    let drag: { x: number; y: number; cam: Cam } | null = null;
    let pinch: { d: number; k: number } | null = null;
    let moved = 0;
    svg.addEventListener("pointerdown", (e) => {
      svg.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
      moved = 0;
      if (pointers.size === 1) drag = { x: e.clientX, y: e.clientY, cam: { ...this.cam } };
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: this.cam.k };
      }
    });
    svg.addEventListener("pointermove", (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY });
      if (pointers.size === 2 && pinch) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.k * (d / pinch.d));
        this.stopFollow();
      } else if (pointers.size === 1 && drag) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
        if (moved > 4) {
          this.tween = null;
          this.stopFollow();
          this.setCam({ ...this.cam, x: drag.cam.x + dx, y: drag.cam.y + dy });
          this.root.classList.add("is-dragging");
        }
      }
      this.hover(e);
    });
    const end = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (pointers.size === 0) {
        drag = null;
        this.root.classList.remove("is-dragging");
      }
    };
    svg.addEventListener("pointerup", end);
    svg.addEventListener("pointercancel", end);
    svg.addEventListener("pointerleave", () => (this.ui.tip.hidden = true));
    svg.addEventListener(
      "wheel",
      (e) => {
        // an embedded viewer must not trap page scrolling: zoom only with Ctrl or Cmd unless it was asked to capture the wheel
        if (!(this.opts.captureWheel || e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        this.stopFollow();
        const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016));
        this.zoomAt(e.offsetX, e.offsetY, this.cam.k * f);
      },
      { passive: false },
    );
    this.root.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT") return;
      if (e.key === " " && target.tagName !== "BUTTON") {
        e.preventDefault();
        if (this.playing) this.pause();
        else this.play();
      } else if (e.key === "+" || e.key === "=") this.zoomBy(1.4);
      else if (e.key === "-") this.zoomBy(1 / 1.4);
      else if (e.key === "0") {
        this.userMoved = false;
        this.flyToFit();
      } else if (e.key === "ArrowRight") {
        this.pause();
        this.pos = Math.min(this.maxPos, Math.floor(this.pos) + 1);
        this.renderPos();
        this.centerOnPulse();
      } else if (e.key === "ArrowLeft") {
        this.pause();
        this.pos = Math.max(0, Math.ceil(this.pos) - 1);
        this.renderPos();
        this.centerOnPulse();
      }
    });
  }

  private hover(e: PointerEvent) {
    const target = (e.target as Element | null)?.closest?.(".fv-node");
    const tip = this.ui.tip;
    if (!target || this.root.classList.contains("is-dragging")) {
      tip.hidden = true;
      return;
    }
    const id = Number(target.getAttribute("data-id"));
    const node = this.data.nodes[id];
    const stage = this.text.stages[node.stage];
    tip.replaceChildren();
    htmlEl("strong", "", this.nameOf(id), tip);
    htmlEl("span", "", `${this.labels.kinds[node.kind]} · ${stage?.title ?? ""}`, tip);
    tip.hidden = false;
    const rect = this.root.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    tip.style.transform = `translate(${Math.min(x + 14, this.W - 260)}px, ${Math.min(y + 16, this.H - 90)}px)`;
  }

  private measure(first = false) {
    const rect = this.root.getBoundingClientRect();
    this.W = rect.width;
    this.H = rect.height;
    let bottom = 0;
    this.headEl.querySelectorAll<HTMLElement>(".fv-titlebox, .fv-tools").forEach((n) => {
      if (getComputedStyle(n).display !== "none") bottom = Math.max(bottom, n.getBoundingClientRect().bottom - rect.top);
    });
    this.bottomH = Math.ceil(this.bottomEl.getBoundingClientRect().height);
    this.root.style.setProperty("--fvb", `${this.bottomH + 12}px`);
    this.scenTop = Math.max(this.W < 700 ? 104 : 78, Math.ceil(bottom) + 10);
    this.navEl.style.top = `${this.scenTop}px`;
    const fit = this.fitCam();
    this.fitK = fit.k;
    if (first || !this.userMoved) this.setCam(fit);
  }

  private insets() {
    return { t: this.scenTop + 54, b: this.bottomH + 28, l: 24, r: 24 };
  }

  private bounds() {
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const s of this.data.stages) {
      x1 = Math.min(x1, s.box[0]);
      y1 = Math.min(y1, s.box[1]);
      x2 = Math.max(x2, s.box[2]);
      y2 = Math.max(y2, s.box[3]);
    }
    const minH = 360;
    const minW = 640;
    if (y2 - y1 < minH) {
      const c = (y1 + y2) / 2;
      y1 = c - minH / 2;
      y2 = c + minH / 2;
    }
    if (x2 - x1 < minW) {
      const c = (x1 + x2) / 2;
      x1 = c - minW / 2;
      x2 = c + minW / 2;
    }
    return { x1, y1, x2, y2 };
  }

  private fitCam(): Cam {
    const b = this.bounds();
    const ins = this.insets();
    const w = b.x2 - b.x1;
    const h = b.y2 - b.y1;
    const aw = Math.max(100, this.W - ins.l - ins.r);
    const ah = Math.max(100, this.H - ins.t - ins.b);
    const k = Math.min(aw / w, ah / h, 1.15);
    return { k, x: ins.l + (aw - w * k) / 2 - b.x1 * k, y: ins.t + (ah - h * k) / 2 - b.y1 * k };
  }

  private setCam(c: Cam) {
    this.cam = { x: c.x, y: c.y, k: clamp(c.k, this.fitK * 0.8, 2.4) };
    const { x, y, k } = this.cam;
    this.world.setAttribute("transform", `translate(${x} ${y}) scale(${k})`);
    this.gEdges.setAttribute("stroke-width", String(1.5 / k));
    this.gHalo.setAttribute("stroke-width", String(11 / k));
    this.gCore.setAttribute("stroke-width", String(2.6 / k));
    this.gHead.setAttribute("stroke-width", String(4.4 / k));
    this.pulseDot.setAttribute("r", String(5.5 / k));
    this.pulseGlow.setAttribute("r", String(17 / k));
    const lod = k < 0.2 ? "far" : k < 0.5 ? "mid" : "near";
    if (this.root.dataset.lod !== lod) this.root.dataset.lod = lod;
    this.root.style.setProperty("--gx", `${x}px`);
    this.root.style.setProperty("--gy", `${y}px`);
    this.root.style.setProperty("--gs", `${k * 28}px`);
    this.placeStageLabels();
  }

  private placeStageLabels() {
    const { x, y, k } = this.cam;
    const top = this.insets().t - 14;
    const placed: { x1: number; x2: number; y: number }[] = [];
    const current = this.currentStage();
    this.data.stages.forEach((s, i) => {
      const btn = this.stageBtns[i];
      const left = s.box[0] * k + x;
      const right = s.box[2] * k + x;
      const topY = s.box[1] * k + y;
      const width = btn.offsetWidth || 120;
      // on a narrow screen only the current stage keeps a label, otherwise the chips cover the diagram
      const visible = right > 0 && left < this.W && topY > -60 && topY < this.H + 40 && (this.W >= 700 || current === i);
      btn.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;
      const bx = clamp(left + 4, 10, Math.max(10, right - width - 8));
      const by = clamp(topY - 34, top, this.H - 40);
      const free = (yy: number) => !placed.some((p) => bx < p.x2 + 6 && bx + width > p.x1 - 6 && Math.abs(yy - p.y) < 30);
      let ty = by;
      let ok = free(by);
      for (let step = 1; !ok && step <= 8; step++) {
        for (const cand of [by - 32 * step, by + 32 * step]) {
          if (cand >= top && cand <= this.H - 40 && free(cand)) {
            ty = cand;
            ok = true;
            break;
          }
        }
      }
      if (!ok && current !== i) {
        btn.style.visibility = "hidden";
        return;
      }
      placed.push({ x1: bx, x2: bx + width, y: ty });
      btn.style.transform = `translate(${bx}px, ${ty}px)`;
      btn.classList.toggle("is-current", current === i);
    });
  }

  private zoomAt(px: number, py: number, k: number) {
    const nk = clamp(k, this.fitK * 0.8, 2.4);
    const wx = (px - this.cam.x) / this.cam.k;
    const wy = (py - this.cam.y) / this.cam.k;
    this.userMoved = true;
    this.tween = null;
    this.setCam({ k: nk, x: px - wx * nk, y: py - wy * nk });
  }

  private zoomBy(f: number) {
    this.stopFollow();
    this.zoomAt(this.W / 2, this.H / 2, this.cam.k * f);
  }

  private flyTo(target: Cam, dur = 0.9) {
    if (this.motionOff()) {
      this.setCam(target);
      return;
    }
    this.tween = { from: { ...this.cam }, to: target, t: 0, dur };
    this.ensureLoop();
  }

  private flyToFit() {
    this.flyTo(this.fitCam());
  }

  private flyToStage(i: number) {
    this.stopFollow();
    const [x1, y1, x2, y2] = this.data.stages[i].box;
    const ins = this.insets();
    const aw = this.W - ins.l - ins.r;
    const ah = this.H - ins.t - ins.b;
    const k = clamp(Math.min(aw / (x2 - x1), ah / (y2 - y1)), this.fitK, 1.1);
    this.userMoved = true;
    this.flyTo({ k, x: ins.l + (aw - (x2 - x1) * k) / 2 - x1 * k, y: ins.t + (ah - (y2 - y1) * k) / 2 - y1 * k });
  }

  private stopFollow() {
    if (this.follow) {
      this.follow = false;
      this.userMoved = true;
      this.syncFollowUi();
    }
  }

  private camToCenter(wx: number, wy: number, k: number): Cam {
    const ins = this.insets();
    const cx = ins.l + (this.W - ins.l - ins.r) / 2;
    const cy = ins.t + (this.H - ins.t - ins.b) / 2;
    return { k, x: cx - wx * k, y: cy - wy * k };
  }

  private centerOnPulse(instant = false) {
    const p = this.pulsePoint();
    if (!p) return;
    const target = this.camToCenter(p.x, p.y, this.follow ? 0.85 : this.cam.k);
    if (!this.follow) return;
    if (instant || this.motionOff()) this.setCam(target);
    else this.flyTo(target, 0.5);
  }

  private get path() {
    return this.data.scenarios[this.scenarioIndex].path;
  }

  private get maxPos() {
    return this.path.length - 1;
  }

  /** Selects a route and shows it from the start. It never starts playback by itself. */
  selectScenario(index: number) {
    this.pause();
    this.scenarioIndex = index;
    this.ui.chips.forEach((chip, i) => chip.setAttribute("aria-pressed", String(i === index)));
    this.gHalo.replaceChildren();
    this.gCore.replaceChildren();
    this.segs = [];
    this.nodeEls.forEach((el) => el.classList.remove("on", "seen", "inpath"));
    this.path.forEach((id) => this.nodeEls.get(id)?.classList.add("inpath"));
    this.root.classList.add("has-route");
    for (let i = 0; i < this.path.length - 1; i++) {
      const base = this.edgeEls.get(`${this.path[i]}>${this.path[i + 1]}`);
      if (!base) continue;
      const d = base.getAttribute("d") ?? "";
      const halo = svgEl("path", { d, class: "halo" }, this.gHalo);
      const core = svgEl("path", { d, class: "core" }, this.gCore);
      const len = base.getTotalLength();
      for (const p of [halo, core]) p.setAttribute("stroke-dasharray", `0 ${len}`);
      this.segs.push({ halo, core, base, len });
    }
    this.pos = 0;
    this.shown = 0;
    this.curNode = -1;
    this.ui.slider.max = String(this.maxPos);
    this.renderPos();
    this.userMoved = false;
    this.flyToFit();
    this.syncPlayUi();
  }

  play() {
    if (this.motionOff()) return;
    if (this.pos >= this.maxPos) {
      this.pos = 0;
      this.shown = 0;
      this.curNode = -1;
    }
    this.playing = true;
    this.syncPlayUi();
    const start = this.nodeAt(0);
    if (this.follow && start) this.flyTo(this.camToCenter(start.x, start.y, 0.85), 0.8);
    this.ensureLoop();
  }

  pause() {
    this.playing = false;
    this.syncPlayUi();
  }

  private finish() {
    this.playing = false;
    this.syncPlayUi();
    if (this.follow) {
      this.timers.push(
        window.setTimeout(() => {
          if (!this.playing) {
            this.userMoved = false;
            this.flyToFit();
          }
        }, 700),
      );
    }
  }

  private nodeAt(i: number) {
    return this.data.nodes[this.path[i]];
  }

  private pulsePoint() {
    if (!this.segs.length) return null;
    const i = clamp(Math.floor(this.pos), 0, this.segs.length - 1);
    const t = this.pos >= this.maxPos ? 1 : clamp(this.pos - i, 0, 1);
    const seg = this.segs[i];
    return seg.base.getPointAtLength(seg.len * t);
  }

  private currentStage() {
    return this.curNode >= 0 ? this.data.nodes[this.path[this.curNode]].stage : -1;
  }

  private renderPos() {
    const n = this.path.length;
    const done = this.pos >= this.maxPos;
    const seg = done ? n - 2 : Math.floor(this.pos);
    const frac = done ? 1 : this.pos - seg;
    const upTo = done ? n - 1 : seg;
    const lo = Math.min(this.shown, upTo);
    const hi = Math.max(this.shown, upTo);
    for (let i = lo; i < hi; i++) this.setSeg(i, i < upTo ? 1 : 0);
    this.shown = upTo;
    if (!done && this.segs[seg]) {
      const s = this.segs[seg];
      this.setSeg(seg, frac);
      this.headPath.setAttribute("d", s.base.getAttribute("d") ?? "");
      const run = s.len * frac;
      const head = Math.min(120, run);
      this.headPath.setAttribute("stroke-dasharray", `${head} ${s.len * 2}`);
      this.headPath.setAttribute("stroke-dashoffset", String(-(run - head)));
      this.headPath.style.opacity = "1";
    } else this.headPath.style.opacity = "0";
    const p = this.pulsePoint();
    if (p) {
      this.pulseGlow.setAttribute("cx", String(p.x));
      this.pulseGlow.setAttribute("cy", String(p.y));
      this.pulseDot.setAttribute("cx", String(p.x));
      this.pulseDot.setAttribute("cy", String(p.y));
    }
    const cur = Math.min(Math.floor(this.pos + 1e-6), n - 1);
    if (cur !== this.curNode) {
      this.curNode = cur;
      this.path.forEach((id, i) => {
        const el = this.nodeEls.get(id);
        el?.classList.toggle("on", i === cur);
        el?.classList.toggle("seen", i < cur);
      });
      this.updateCaption();
      this.placeStageLabels();
    }
    this.ui.slider.value = String(Math.floor(this.pos));
  }

  private setSeg(i: number, t: number) {
    const s = this.segs[i];
    if (!s) return;
    for (const p of [s.halo, s.core]) {
      if (t >= 1) p.removeAttribute("stroke-dasharray");
      else p.setAttribute("stroke-dasharray", `${s.len * t} ${s.len * 2}`);
    }
    s.core.classList.toggle("settled", t >= 1);
    s.halo.classList.toggle("settled", t >= 1);
  }

  private updateCaption() {
    if (this.curNode < 0) return;
    const node = this.nodeAt(this.curNode);
    const id = this.path[this.curNode];
    const stage = this.text.stages[node.stage];
    const total = this.path.length;
    const last = this.curNode === total - 1;
    this.ui.capStep.textContent = this.labels.stepOf.replace("{n}", String(this.curNode + 1)).replace("{total}", String(total));
    this.ui.capTitle.textContent = this.nameOf(id);
    this.ui.capSub.replaceChildren();
    if (stage) {
      const b = htmlEl("b", "", stage.title + (/[.?!]$/.test(stage.title) ? "" : "."), this.ui.capSub);
      b.after(document.createTextNode(` ${stage.desc}`));
    }
    this.ui.capFoot.textContent = last ? (this.text.scenarios[this.scenarioIndex]?.desc ?? "") : "";
    this.ui.capFoot.hidden = !last;
    this.root.style.setProperty("--cap-hue", String(this.data.stages[node.stage]?.hue ?? 205));
  }

  private syncPlayUi() {
    const off = this.motionOff();
    const finished = this.pos >= this.maxPos && !this.playing;
    const btn = this.ui.play;
    btn.disabled = off;
    this.ui.note.hidden = !off;
    btn.replaceChildren();
    const icon = svgEl("svg", { viewBox: "0 0 20 20", "aria-hidden": "true" }, btn);
    if (this.playing) svgEl("path", { d: "M5 3h3.5v14H5zM11.5 3H15v14h-3.5z" }, icon);
    else if (finished) svgEl("path", { d: "M10 3a7 7 0 1 0 6.6 4.7M10 3V0M10 3 7 6", fill: "none", "stroke-width": 1.8, "stroke-linecap": "round" }, icon);
    else svgEl("path", { d: "M5 3l12 7-12 7z" }, icon);
    htmlEl("span", "", this.playing ? this.labels.pause : finished ? this.labels.replay : this.labels.play, btn);
    this.root.classList.toggle("is-playing", this.playing);
    this.root.classList.toggle("is-still", off);
  }

  private syncSpeedUi() {
    this.ui.speed.forEach((b, i) => b.setAttribute("aria-pressed", String([1, 2, 4][i] === this.speed)));
  }

  private syncFollowUi() {
    this.ui.follow.setAttribute("aria-pressed", String(this.follow));
  }

  private ensureLoop() {
    if (this.raf) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    const dt = clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;
    if (this.playing) {
      this.pos = clamp(this.pos + (dt * this.speed) / 0.84, 0, this.maxPos);
      this.renderPos();
      if (this.pos >= this.maxPos) this.finish();
    }
    if (this.tween) {
      const tw = this.tween;
      tw.t = Math.min(1, tw.t + dt / tw.dur);
      const e = easeInOut(tw.t);
      this.setCam({ x: tw.from.x + (tw.to.x - tw.from.x) * e, y: tw.from.y + (tw.to.y - tw.from.y) * e, k: tw.from.k + (tw.to.k - tw.from.k) * e });
      if (tw.t >= 1) this.tween = null;
    } else if (this.follow && this.playing) {
      const p = this.pulsePoint();
      if (p) {
        const target = this.camToCenter(p.x, p.y, 0.85);
        const f = 1 - Math.exp(-dt * 5);
        this.setCam({ x: this.cam.x + (target.x - this.cam.x) * f, y: this.cam.y + (target.y - this.cam.y) * f, k: this.cam.k + (target.k - this.cam.k) * f });
      }
    }
    this.raf = this.playing || this.tween ? requestAnimationFrame(this.tick) : 0;
  };
}
