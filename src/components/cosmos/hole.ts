/**
 * Black hole path. One source for both renderers (WebGL shader on `full`, a CSS element on `lite`).
 * Coordinates are in screen-height units with the origin at the screen centre and y pointing up,
 * so x runs from -aspect/2 to +aspect/2. The hole drifts side to side as the page scrolls and lingers
 * near the screen edges, crossing the middle quickly, so it rarely sits behind the text column.
 */
export type Hole = { x: number; y: number; r: number };

const out: Hole = { x: 0, y: 0, r: 0 };

/** `scroll` is scrollY / innerHeight. Returns a shared object: copy values out, do not keep it. */
export function holePos(scroll: number, aspect: number): Hole {
  const s = Math.sin(scroll * 0.6 + 0.9);
  out.x = aspect * 0.46 * Math.sign(s) * Math.pow(Math.abs(s), 0.4);
  out.y = 0.22 * Math.sin(scroll * 0.8 + 2.0);
  out.r = aspect < 0.8 ? 0.055 : 0.07;
  return out;
}
