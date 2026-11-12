import type { FlowKind, FlowStructure, FlowTexts, ViewerLabels } from "./flowViewer";
import type { Locale } from "./i18n";

export type FlowSlug =
  | "purchasing"
  | "whatsapp" | "igfb" | "staff" | "resolve" | "health" | "daily" | "weekly" | "error"
  | "kwgen" | "kwappr" | "kwfb" | "tiktok" | "comments" | "metrics" | "youtube"
  | "vsystem";

export type FlowUi = ViewerLabels & {
  hint: string;
  pickFlow: string;
  openFull: string;
  loading: string;
  noScript: string;
  mobileNote: string;
  speed: string;
};

export type FlowsDict = {
  ui: FlowUi;
  /** Case study slug -> flows shown on that card, in display order. */
  groups: Record<string, FlowSlug[]>;
  flows: Record<FlowSlug, FlowTexts>;
};

export type { FlowKind, FlowStructure, FlowTexts };

// Explicit dynamic imports (no template paths) so the bundler can split each file and nothing loads until it is needed.
const dicts: Record<Locale, () => Promise<FlowsDict>> = {
  id: () => import("@content/id/flows.json").then((m) => m.default as unknown as FlowsDict),
  en: () => import("@content/en/flows.json").then((m) => m.default as unknown as FlowsDict),
};

const load = <T>(p: Promise<{ default: unknown }>) => p.then((m) => m.default as unknown as T);
const structures: Record<FlowSlug, () => Promise<FlowStructure>> = {
  purchasing: () => load(import("@content/flows/purchasing.json")),
  whatsapp: () => load(import("@content/flows/whatsapp.json")),
  igfb: () => load(import("@content/flows/igfb.json")),
  staff: () => load(import("@content/flows/staff.json")),
  resolve: () => load(import("@content/flows/resolve.json")),
  health: () => load(import("@content/flows/health.json")),
  daily: () => load(import("@content/flows/daily.json")),
  weekly: () => load(import("@content/flows/weekly.json")),
  error: () => load(import("@content/flows/error.json")),
  kwgen: () => load(import("@content/flows/kwgen.json")),
  kwappr: () => load(import("@content/flows/kwappr.json")),
  kwfb: () => load(import("@content/flows/kwfb.json")),
  tiktok: () => load(import("@content/flows/tiktok.json")),
  comments: () => load(import("@content/flows/comments.json")),
  metrics: () => load(import("@content/flows/metrics.json")),
  youtube: () => load(import("@content/flows/youtube.json")),
  vsystem: () => load(import("@content/flows/vsystem.json")),
};

export const loadFlowsDict = (locale: Locale) => dicts[locale]();
export const loadFlowStructure = (slug: FlowSlug) => structures[slug]();
export const isFlowSlug = (v: string): v is FlowSlug => v in structures;
