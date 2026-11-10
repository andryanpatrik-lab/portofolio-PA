export type Vec3 = [number, number, number];

export type Palette = {
  /** Three nebula tints and an overall strength. Display-space colours, all kept dark (see the clamp in the shader). */
  a: Vec3;
  b: Vec3;
  c: Vec3;
  intensity: number;
};

export type CosmosKey = "void" | "nebula" | "aurora" | "ember" | "supernova";

/** Mood per section, set with data-cosmos. Every palette stays dark so text contrast holds. */
export const palettes: Record<CosmosKey, Palette> = {
  void: { a: [0.2, 0.14, 0.03], b: [0.08, 0.08, 0.22], c: [0.1, 0.06, 0.2], intensity: 0.28 },
  nebula: { a: [0.42, 0.22, 0.78], b: [0.18, 0.3, 0.85], c: [0.75, 0.2, 0.65], intensity: 0.36 },
  aurora: { a: [0.05, 0.75, 0.62], b: [0.1, 0.35, 0.85], c: [0.35, 0.8, 0.35], intensity: 0.32 },
  ember: { a: [0.95, 0.38, 0.08], b: [0.8, 0.15, 0.2], c: [0.95, 0.65, 0.15], intensity: 0.32 },
  supernova: { a: [1.0, 0.8, 0.2], b: [0.85, 0.25, 0.75], c: [0.35, 0.5, 1.0], intensity: 0.38 },
};

export const BASE: Vec3 = [12 / 255, 10 / 255, 9 / 255];
