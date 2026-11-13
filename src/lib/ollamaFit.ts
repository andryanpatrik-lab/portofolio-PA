// Pure helpers shared by the server section and the client RAM picker.
// Rule of thumb from the test sheet: 4-bit quantisation needs about gbPerBillion GB per billion parameters plus a fixed overhead,
// and only a share of the device RAM can be used (the rest belongs to the operating system and other apps).
export type OllamaSettings = { ramGb: number; gbPerBillion: number; overheadGb: number; usableShare: number };

export type OllamaModel = {
  name: string;
  size: string | null;
  params: number | null;
  ram: number | null;
  cap: string | null;
  pulls: number | null;
};

export const budgetGb = (ramGb: number, s: OllamaSettings) => ramGb * s.usableShare;

/** Largest model (billions of parameters) that fits in the given device RAM. */
export const maxParams = (ramGb: number, s: OllamaSettings) => Math.max(0, (budgetGb(ramGb, s) - s.overheadGb) / s.gbPerBillion);

export const neededGb = (params: number, s: OllamaSettings) => params * s.gbPerBillion + s.overheadGb;

export const fits = (m: OllamaModel, ramGb: number, s: OllamaSettings) => m.params != null && neededGb(m.params, s) <= budgetGb(ramGb, s) + 1e-9;

export const byPopularity = (a: OllamaModel, b: OllamaModel) => (b.pulls ?? 0) - (a.pulls ?? 0);
