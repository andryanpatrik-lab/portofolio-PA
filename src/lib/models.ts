/** One row of the "Full Model" tab, as written by scripts/fetch-models.mjs. Prices are USD per 1M tokens. */
export type ModelRow = {
  key: string | null;
  id: string;
  vendor: string | null;
  type: string | null;
  context: number | null;
  orIn: number | null;
  orOut: number | null;
  spIn: number | null;
  spOut: number | null;
  spCache: number | null;
  tkIn: number | null;
  tkOut: number | null;
  tkCache: number | null;
  tkUnit: string | null;
  mixOr: number | null;
  mixSp: number | null;
  mixTk: number | null;
  best: string | null;
  tkVsOr: number | null;
  tkVsSp: number | null;
  sources: number | null;
  avail: string | null;
  note: string | null;
  tkDate: string | null;
};

export type ModelsData = {
  status: "ok" | "stale" | "no-data";
  source: string;
  updatedAt: string | null;
  fx: { rate: number; date: string | null } | null;
  models: ModelRow[];
};

export type SourceCode = "OR" | "SP" | "TK";
export const SOURCES: SourceCode[] = ["OR", "SP", "TK"];

export type SortKey =
  | "id" | "vendor" | "type" | "context"
  | "orIn" | "orOut" | "spIn" | "spOut" | "tkIn" | "tkOut"
  | "mixOr" | "mixSp" | "mixTk" | "mixBest" | "sources" | "costBest";

export type Filters = {
  q: string;
  types: string[];
  vendor: string;
  avail: SourceCode[];
  minSources: number;
  maxIn: number | null;
  minCtx: number | null;
  free: boolean;
};

export type CalcState = { on: boolean; inM: number; outM: number };

export const DEFAULT_FILTERS: Filters = { q: "", types: [], vendor: "", avail: [], minSources: 1, maxIn: null, minCtx: null, free: false };
export const DEFAULT_CALC: CalcState = { on: false, inM: 100, outM: 20 };

const has = (m: ModelRow, s: SourceCode) => (m.avail ?? "").split(/\s+/).includes(s);

/** Cheapest input price across the sources that have one. */
export function minInput(m: ModelRow): number | null {
  const v = [m.orIn, m.spIn, m.tkIn].filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
}

export function minMix(m: ModelRow): number | null {
  const v = [m.mixOr, m.mixSp, m.mixTk].filter((x): x is number => x != null);
  return v.length ? Math.min(...v) : null;
}

/** Monthly cost in USD for one source: millions of tokens in/out times USD per 1M. Null when the source has no price. */
export function monthlyCost(inPrice: number | null, outPrice: number | null, calc: CalcState): number | null {
  if (inPrice == null && outPrice == null) return null;
  return (inPrice ?? 0) * calc.inM + (outPrice ?? 0) * calc.outM;
}

export function costs(m: ModelRow, calc: CalcState) {
  return { OR: monthlyCost(m.orIn, m.orOut, calc), SP: monthlyCost(m.spIn, m.spOut, calc), TK: monthlyCost(m.tkIn, m.tkOut, calc) };
}

export function bestCost(m: ModelRow, calc: CalcState): { source: SourceCode; cost: number } | null {
  const c = costs(m, calc);
  let best: { source: SourceCode; cost: number } | null = null;
  for (const s of SOURCES) {
    const v = c[s];
    if (v != null && (best == null || v < best.cost)) best = { source: s, cost: v };
  }
  return best;
}

export function applyFilters(models: ModelRow[], f: Filters): ModelRow[] {
  const q = f.q.trim().toLowerCase();
  return models.filter((m) => {
    if (q && !`${m.id} ${m.vendor ?? ""}`.toLowerCase().includes(q)) return false;
    if (f.types.length && !f.types.includes(m.type ?? "")) return false;
    if (f.vendor && m.vendor !== f.vendor) return false;
    if (f.avail.length && !f.avail.every((s) => has(m, s))) return false;
    if ((m.sources ?? 0) < f.minSources) return false;
    if (f.maxIn != null) {
      const p = minInput(m);
      if (p == null || p > f.maxIn) return false;
    }
    if (f.minCtx != null && (m.context ?? 0) < f.minCtx) return false;
    if (f.free) {
      const free = (a: number | null, b: number | null) => a === 0 && b === 0;
      if (!(free(m.orIn, m.orOut) || free(m.spIn, m.spOut) || free(m.tkIn, m.tkOut))) return false;
    }
    return true;
  });
}

function sortValue(m: ModelRow, key: SortKey, calc: CalcState): number | string | null {
  switch (key) {
    case "id": return m.id.toLowerCase();
    case "vendor": return (m.vendor ?? "").toLowerCase() || null;
    case "type": return (m.type ?? "").toLowerCase() || null;
    case "mixBest": return minMix(m);
    case "costBest": return bestCost(m, calc)?.cost ?? null;
    default: return m[key];
  }
}

/** Stable sort; empty values always go last, whatever the direction. */
export function sortRows(rows: ModelRow[], key: SortKey, dir: "asc" | "desc", calc: CalcState): ModelRow[] {
  const sign = dir === "asc" ? 1 : -1;
  return rows
    .map((m, i) => ({ m, i, v: sortValue(m, key, calc) }))
    .sort((a, b) => {
      if (a.v == null && b.v == null) return a.i - b.i;
      if (a.v == null) return 1;
      if (b.v == null) return -1;
      const c = typeof a.v === "string" ? a.v.localeCompare(String(b.v)) : (a.v as number) - (b.v as number);
      return c === 0 ? a.i - b.i : c * sign;
    })
    .map((x) => x.m);
}

export function compact(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1000) return `${+(n / 1000).toFixed(0)}K`;
  return String(n);
}

/** USD or IDR (needs the build-time rate). Small prices keep up to four decimals; zero shows "0". */
export function formatPrice(usd: number | null, currency: "USD" | "IDR", fx: number | null, locale: string): string {
  if (usd == null) return "";
  if (usd === 0) return "0";
  const idr = currency === "IDR" && fx != null;
  const v = idr ? usd * (fx as number) : usd;
  const digits = idr ? (v >= 100 ? 0 : 2) : v >= 100 ? 0 : v >= 1 ? 2 : 4;
  return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v);
}

// ---- Shareable state in the query string -------------------------------------------------------------------------

export type ViewState = {
  filters: Filters;
  sort: SortKey;
  dir: "asc" | "desc";
  page: number;
  currency: "USD" | "IDR";
  calc: CalcState;
};

export const DEFAULT_VIEW: ViewState = { filters: DEFAULT_FILTERS, sort: "id", dir: "asc", page: 1, currency: "USD", calc: DEFAULT_CALC };

const SORT_KEYS = new Set<string>(["id", "vendor", "type", "context", "orIn", "orOut", "spIn", "spOut", "tkIn", "tkOut", "mixOr", "mixSp", "mixTk", "mixBest", "sources", "costBest"]);
const numOrNull = (s: string | null) => (s != null && s !== "" && Number.isFinite(Number(s)) ? Number(s) : null);

export function readView(search: string): ViewState {
  const p = new URLSearchParams(search);
  const sort = p.get("sort") ?? "";
  const calcIn = numOrNull(p.get("cin"));
  const calcOut = numOrNull(p.get("cout"));
  return {
    filters: {
      q: p.get("q") ?? "",
      types: (p.get("t") ?? "").split(",").filter(Boolean),
      vendor: p.get("v") ?? "",
      avail: (p.get("a") ?? "").split(",").filter((s): s is SourceCode => (SOURCES as string[]).includes(s)),
      minSources: Math.min(3, Math.max(1, numOrNull(p.get("s")) ?? 1)),
      maxIn: numOrNull(p.get("max")),
      minCtx: numOrNull(p.get("ctx")),
      free: p.get("free") === "1",
    },
    sort: (SORT_KEYS.has(sort) ? sort : "id") as SortKey,
    dir: p.get("dir") === "desc" ? "desc" : "asc",
    page: Math.max(1, numOrNull(p.get("page")) ?? 1),
    currency: p.get("cur") === "IDR" ? "IDR" : "USD",
    calc: { on: p.get("calc") === "1", inM: calcIn ?? DEFAULT_CALC.inM, outM: calcOut ?? DEFAULT_CALC.outM },
  };
}

export function writeView(v: ViewState): string {
  const p = new URLSearchParams();
  if (v.filters.q) p.set("q", v.filters.q);
  if (v.filters.types.length) p.set("t", v.filters.types.join(","));
  if (v.filters.vendor) p.set("v", v.filters.vendor);
  if (v.filters.avail.length) p.set("a", v.filters.avail.join(","));
  if (v.filters.minSources > 1) p.set("s", String(v.filters.minSources));
  if (v.filters.maxIn != null) p.set("max", String(v.filters.maxIn));
  if (v.filters.minCtx != null) p.set("ctx", String(v.filters.minCtx));
  if (v.filters.free) p.set("free", "1");
  if (v.sort !== "id") p.set("sort", v.sort);
  if (v.dir !== "asc") p.set("dir", v.dir);
  if (v.page > 1) p.set("page", String(v.page));
  if (v.currency !== "USD") p.set("cur", v.currency);
  if (v.calc.on) {
    p.set("calc", "1");
    p.set("cin", String(v.calc.inM));
    p.set("cout", String(v.calc.outM));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

// ---- CSV export --------------------------------------------------------------------------------------------------

const csvCell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCsv(rows: ModelRow[]): string {
  const cols: [string, (m: ModelRow) => unknown][] = [
    ["Model", (m) => m.id], ["Vendor", (m) => m.vendor], ["Type", (m) => m.type], ["Context", (m) => m.context],
    ["OpenRouter input USD/1M", (m) => m.orIn], ["OpenRouter output USD/1M", (m) => m.orOut],
    ["Sumopod input USD/1M", (m) => m.spIn], ["Sumopod output USD/1M", (m) => m.spOut],
    ["TokenKu input USD/1M", (m) => m.tkIn], ["TokenKu output USD/1M", (m) => m.tkOut],
    ["Blend 3:1 OpenRouter", (m) => m.mixOr], ["Blend 3:1 Sumopod", (m) => m.mixSp], ["Blend 3:1 TokenKu", (m) => m.mixTk],
    ["Cheapest", (m) => m.best], ["Sources", (m) => m.sources],
  ];
  return [cols.map(([h]) => csvCell(h)).join(","), ...rows.map((m) => cols.map(([, f]) => csvCell(f(m))).join(","))].join("\n");
}
