import { BASE, type Palette, type Vec3 } from "./palettes";

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Nebula (domain-warped fbm) and layered twinkling stars in one fragment shader.
const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes; uniform float uTime; uniform float uScroll;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uBase; uniform float uIntensity;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
vec3 stars(vec2 uv){
  vec3 s = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float scale = 18.0 + fi * 16.0;
    vec2 p = uv * scale;
    p.y += uScroll * scale * (0.08 + 0.06 * fi);
    vec2 id = floor(p), f = fract(p) - 0.5;
    float h = hash(id + fi * 13.7);
    vec2 off = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.6;
    float d = length(f - off);
    float tw = 0.65 + 0.35 * sin(uTime * (0.8 + h * 2.0) + h * 60.0);
    float b = smoothstep(0.06 - 0.012 * fi, 0.0, d) * tw * step(0.965, h);
    s += mix(vec3(0.8, 0.9, 1.0), vec3(1.0, 0.9, 0.75), hash(id + 9.2)) * b * (0.9 - 0.2 * fi);
  }
  return s;
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.02;
  vec2 p = uv * 1.3 + vec2(0.0, uScroll * 0.25);
  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  float r = fbm(p + 2.2 * q + vec2(1.7, 9.2) + t * 0.5);
  float d = smoothstep(0.32, 0.95, r);
  vec3 tint = mix(uA, uB, q.x);
  tint = mix(tint, uC, q.y * d);
  vec3 col = uBase + tint * d * uIntensity;
  col = min(col, vec3(0.3));
  col *= 1.0 - 0.45 * dot(uv, uv) * 0.6;
  col += stars(uv) * 0.85;
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

export type Renderer = {
  setTarget(p: Palette): void;
  setScroll(viewportsScrolled: number): void;
  setScale(scale: number): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

type Options = {
  scale: number;
  /** Called when frames are too slow: 1 = lower the resolution, 2 = give up. */
  onSlow(level: 1 | 2): void;
  onLost(): void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

/** Full-screen shader renderer: 30 fps cap, low render resolution, pauses on demand, reports slow frames. */
export function createRenderer(canvas: HTMLCanvasElement, opts: Options): Renderer | null {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uTime = U("uTime"), uScroll = U("uScroll");
  const uA = U("uA"), uB = U("uB"), uC = U("uC"), uBase = U("uBase"), uIntensity = U("uIntensity");

  let scale = opts.scale;
  let width = 0;
  let height = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(2, Math.round(window.innerWidth * dpr * scale));
    height = Math.max(2, Math.round(window.innerHeight * dpr * scale));
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };
  resize();

  const cur = { a: [0.2, 0.14, 0.03] as Vec3, b: [0.08, 0.08, 0.22] as Vec3, c: [0.1, 0.06, 0.2] as Vec3, intensity: 0.28 };
  let target: Palette = { ...cur };
  let scrollV = 0;
  let raf = 0;
  let running = false;
  let last = 0;
  const t0 = performance.now();
  let frames = 0;
  let sum = 0;
  let slowCount = 0;

  const lerp3 = (from: Vec3, to: Vec3, k: number) => {
    for (let i = 0; i < 3; i++) from[i] += (to[i] - from[i]) * k;
  };

  const tick = (now: number) => {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const dt = now - last;
    if (dt < 32) return; // cap near 30 fps
    last = now;
    // Frame-time watchdog: skip warm-up, then average 60 rendered frames.
    frames++;
    if (frames > 15) sum += dt;
    if (frames === 75) {
      const avg = sum / 60;
      frames = 15;
      sum = 0;
      if (avg > 42) {
        slowCount++;
        opts.onSlow(slowCount === 1 ? 1 : 2);
      }
    }
    const k = 1 - Math.exp(-Math.min(dt, 100) / 350);
    lerp3(cur.a, target.a, k);
    lerp3(cur.b, target.b, k);
    lerp3(cur.c, target.c, k);
    cur.intensity += (target.intensity - cur.intensity) * k;
    gl.uniform2f(uRes, width, height);
    gl.uniform1f(uTime, (now - t0) / 1000);
    gl.uniform1f(uScroll, scrollV);
    gl.uniform3fv(uA, cur.a);
    gl.uniform3fv(uB, cur.b);
    gl.uniform3fv(uC, cur.c);
    gl.uniform3fv(uBase, BASE);
    gl.uniform1f(uIntensity, cur.intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const onLost = (e: Event) => {
    e.preventDefault();
    running = false;
    cancelAnimationFrame(raf);
    opts.onLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  return {
    setTarget(p) {
      target = p;
    },
    setScroll(v) {
      scrollV = v;
    },
    setScale(s) {
      scale = s;
      resize();
      frames = 0;
      sum = 0;
    },
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      frames = 0;
      sum = 0;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    },
  };
}
