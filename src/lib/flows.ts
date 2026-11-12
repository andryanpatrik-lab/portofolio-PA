import type { FlowKind, FlowStructure, FlowTexts, ViewerLabels } from "./flowViewer";
import type { Locale } from "./i18n";

export type FlowSlug = "whatsapp" | "staff" | "health" | "daily" | "error";

export type FlowUi = ViewerLabels & {
  hint: string;
  pickFlow: string;
  openFull: string;
  loading: string;
  noScript: string;
  speed: string;
};

export type FlowsDict = {
  ui: FlowUi;
  order: FlowSlug[];
  flows: Record<FlowSlug, FlowTexts>;
};

export type { FlowKind, FlowStructure, FlowTexts };

// Explicit dynamic imports (no template paths) so the bundler can split each file and nothing loads until it is needed.
const dicts: Record<Locale, () => Promise<FlowsDict>> = {
  id: () => import("@content/id/flows.json").then((m) => m.default as unknown as FlowsDict),
  en: () => import("@content/en/flows.json").then((m) => m.default as unknown as FlowsDict),
};

const structures: Record<FlowSlug, () => Promise<FlowStructure>> = {
  whatsapp: () => import("@content/flows/whatsapp.json").then((m) => m.default as unknown as FlowStructure),
  staff: () => import("@content/flows/staff.json").then((m) => m.default as unknown as FlowStructure),
  health: () => import("@content/flows/health.json").then((m) => m.default as unknown as FlowStructure),
  daily: () => import("@content/flows/daily.json").then((m) => m.default as unknown as FlowStructure),
  error: () => import("@content/flows/error.json").then((m) => m.default as unknown as FlowStructure),
};

export const loadFlowsDict = (locale: Locale) => dicts[locale]();
export const loadFlowStructure = (slug: FlowSlug) => structures[slug]();
export const isFlowSlug = (v: string): v is FlowSlug => v in structures;
