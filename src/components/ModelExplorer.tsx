"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type ui from "@content/id/models.json";
import {
  DEFAULT_FILTERS,
  DEFAULT_VIEW,
  SOURCES,
  applyFilters,
  bestCost,
  compact,
  costs,
  formatPrice,
  minMix,
  readView,
  sortRows,
  toCsv,
  writeView,
  type Filters,
  type ModelRow,
  type ModelsData,
  type SortKey,
  type SourceCode,
  type ViewState,
} from "@/lib/models";

type Ui = typeof ui;

const PAGE = 50;
const CTX_OPTIONS = [8192, 32768, 131072, 200000, 1000000];

type Col = { id: string; sort: SortKey | null; label: string; num?: boolean; cell: (m: ModelRow) => ReactNode };

const bestCode = (m: ModelRow): SourceCode | null => {
  const b = (m.best ?? "").toLowerCase();
  return b.includes("openrouter") ? "OR" : b.includes("sumopod") ? "SP" : b.includes("tokenku") ? "TK" : null;
};

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ""));
}

/**
 * Model catalog: loads /data/models.json (written at build time from the sheet) and filters, sorts, and pages it in memory.
 * The view state lives in the query string so a link reproduces the same list. No motion beyond focus and hover styles.
 */
export function ModelExplorer({ ui, locale }: { ui: Ui; locale: string }) {
  const [data, setData] = useState<ModelsData | null>(null);
  const [old, setOld] = useState(false);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW);
  const [qInput, setQInput] = useState("");
  const [allCols, setAllCols] = useState(false);

  useEffect(() => {
    let off = false;
    fetch("/data/models.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<ModelsData>;
      })
      .then((d) => {
        if (off) return;
        const v = readView(window.location.search);
        setData(d);
        setOld(d.updatedAt ? Date.now() - new Date(d.updatedAt).getTime() > 36 * 3600 * 1000 : false);
        setView(v);
        setQInput(v.filters.q);
        setReady(true);
      })
      .catch(() => {
        if (!off) setError(true);
      });
    return () => {
      off = true;
    };
  }, []);

  // keep the query string in step with the view
  useEffect(() => {
    if (!ready) return;
    window.history.replaceState(null, "", window.location.pathname + writeView(view) + window.location.hash);
  }, [view, ready]);

  // debounce the search box
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setView((v) => (v.filters.q === qInput ? v : { ...v, filters: { ...v.filters, q: qInput }, page: 1 })), 200);
    return () => window.clearTimeout(t);
  }, [qInput, ready]);

  const models = useMemo(() => data?.models ?? [], [data]);
  const types = useMemo(() => {
    const c = new Map<string, number>();
    models.forEach((m) => c.set(m.type ?? "?", (c.get(m.type ?? "?") ?? 0) + 1));
    return [...c.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [models]);
  const vendors = useMemo(() => [...new Set(models.map((m) => m.vendor).filter((v): v is string => !!v))].sort(), [models]);
  const filtered = useMemo(() => applyFilters(models, view.filters), [models, view.filters]);
  const sorted = useMemo(() => sortRows(filtered, view.sort, view.dir, view.calc), [filtered, view.sort, view.dir, view.calc]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const page = Math.min(view.page, pages);
  const slice = sorted.slice((page - 1) * PAGE, page * PAGE);

  const fx = data?.fx?.rate ?? null;
  const cur = view.currency === "IDR" && fx ? "IDR" : "USD";
  const fmt = (n: number | null) => formatPrice(n, cur, fx, locale);
  const patch = (f: Partial<Filters>) => setView((v) => ({ ...v, filters: { ...v.filters, ...f }, page: 1 }));

  if (error) return <p role="alert" className="mdl-status">{ui.loadError}</p>;
  if (!data) return <p role="status" className="mdl-status">{ui.loading}</p>;
  if (data.status === "no-data" || models.length === 0) return <p role="status" className="mdl-status">{ui.noData}</p>;

  const cols: Col[] = [
    {
      id: "id",
      sort: "id",
      label: ui.cols.id,
      cell: (m) => (
        <>
          <span className="mdl-id">{m.id}</span>
          {m.vendor && <span className="mdl-sub">{m.vendor}</span>}
        </>
      ),
    },
    { id: "type", sort: "type", label: ui.cols.type, cell: (m) => m.type ?? "–" },
    { id: "context", sort: "context", label: ui.cols.context, num: true, cell: (m) => (m.context ? compact(m.context) : "–") },
    { id: "mixBest", sort: "mixBest", label: ui.cols.mixBest, num: true, cell: (m) => fmt(minMix(m)) || "–" },
    { id: "best", sort: null, label: ui.cols.best, cell: (m) => (bestCode(m) ? ui.sources[bestCode(m) as SourceCode] : "–") },
    { id: "sources", sort: "sources", label: ui.cols.sources, num: true, cell: (m) => m.sources ?? "–" },
  ];
  if (allCols) {
    const add: [string, SortKey, (m: ModelRow) => number | null, SourceCode][] = [
      ["orIn", "orIn", (m) => m.orIn, "OR"], ["orOut", "orOut", (m) => m.orOut, "OR"],
      ["spIn", "spIn", (m) => m.spIn, "SP"], ["spOut", "spOut", (m) => m.spOut, "SP"],
      ["tkIn", "tkIn", (m) => m.tkIn, "TK"], ["tkOut", "tkOut", (m) => m.tkOut, "TK"],
      ["mixOr", "mixOr", (m) => m.mixOr, "OR"], ["mixSp", "mixSp", (m) => m.mixSp, "SP"], ["mixTk", "mixTk", (m) => m.mixTk, "TK"],
    ];
    for (const [id, sort, get, src] of add) {
      cols.splice(cols.length - 2, 0, {
        id,
        sort,
        label: ui.cols[id as keyof typeof ui.cols],
        num: true,
        cell: (m) => <span className={bestCode(m) === src ? "is-best" : undefined}>{fmt(get(m)) || "–"}</span>,
      });
    }
  }
  if (view.calc.on) {
    for (const s of SOURCES) {
      cols.push({
        id: `cost${s}`,
        sort: null,
        label: ui.cols[`cost${s}` as keyof typeof ui.cols],
        num: true,
        cell: (m) => <span className={bestCost(m, view.calc)?.source === s ? "is-best" : undefined}>{fmt(costs(m, view.calc)[s]) || "–"}</span>,
      });
    }
    cols.push({ id: "costBest", sort: "costBest", label: ui.cols.costBest, num: true, cell: (m) => fmt(bestCost(m, view.calc)?.cost ?? null) || "–" });
  }

  const sortOptions: [SortKey, string][] = [
    ["id", ui.cols.id], ["vendor", ui.cols.vendor], ["type", ui.cols.type], ["context", ui.cols.context],
    ["mixBest", ui.cols.mixBest], ["sources", ui.cols.sources], ...(view.calc.on ? ([["costBest", ui.cols.costBest]] as [SortKey, string][]) : []),
  ];

  const toggleSort = (key: SortKey) =>
    setView((v) => ({ ...v, sort: key, dir: v.sort === key && v.dir === "asc" ? "desc" : "asc", page: 1 }));

  const exportCsv = () => {
    const blob = new Blob([toCsv(sorted)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-models.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stamp = data.updatedAt
    ? new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(data.updatedAt))
    : "";

  return (
    <div className="mdl">
      <p className="t-caption mdl-stamp">
        {ui.updated}: {stamp} WIB
        {data.status === "stale" && <span className="mdl-warn"> · {ui.staleSource}</span>}
        {old && <span className="mdl-warn"> · {ui.stale}</span>}
      </p>

      <div className="mdl-search">
        <label htmlFor="mdl-q" className="t-label">{ui.search}</label>
        <input id="mdl-q" type="search" value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder={ui.searchPlaceholder} autoComplete="off" />
      </div>

      <details className="mdl-filters" open>
        <summary className="t-label">{ui.filters}</summary>
        <div className="mdl-filter-grid">
          <fieldset>
            <legend className="t-label">{ui.type}</legend>
            <div className="mdl-chips">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="mdl-chip"
                  aria-pressed={view.filters.types.includes(t)}
                  onClick={() => patch({ types: view.filters.types.includes(t) ? view.filters.types.filter((x) => x !== t) : [...view.filters.types, t] })}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="mdl-vendor" className="t-label">{ui.vendor}</label>
            <select id="mdl-vendor" value={view.filters.vendor} onChange={(e) => patch({ vendor: e.target.value })}>
              <option value="">{ui.anyVendor}</option>
              {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <fieldset>
            <legend className="t-label">{ui.availableIn}</legend>
            <div className="mdl-checks">
              {SOURCES.map((s) => (
                <label key={s}>
                  <input
                    type="checkbox"
                    checked={view.filters.avail.includes(s)}
                    onChange={() => patch({ avail: view.filters.avail.includes(s) ? view.filters.avail.filter((x) => x !== s) : [...view.filters.avail, s] })}
                  />
                  {ui.sources[s]}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="mdl-min" className="t-label">{ui.minSources}</label>
            <select id="mdl-min" value={view.filters.minSources} onChange={(e) => patch({ minSources: Number(e.target.value) })}>
              {[1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="mdl-max" className="t-label">{ui.maxInput}</label>
            <input
              id="mdl-max"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={view.filters.maxIn ?? ""}
              onChange={(e) => patch({ maxIn: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
          <div>
            <label htmlFor="mdl-ctx" className="t-label">{ui.minContext}</label>
            <select id="mdl-ctx" value={view.filters.minCtx ?? ""} onChange={(e) => patch({ minCtx: e.target.value === "" ? null : Number(e.target.value) })}>
              <option value="">{ui.anyContext}</option>
              {CTX_OPTIONS.map((c) => <option key={c} value={c}>{compact(c)}</option>)}
            </select>
          </div>
          <label className="mdl-free">
            <input type="checkbox" checked={view.filters.free} onChange={(e) => patch({ free: e.target.checked })} />
            {ui.freeOnly}
          </label>
          <button
            type="button"
            className="mdl-btn"
            onClick={() => {
              setQInput("");
              setView((v) => ({ ...DEFAULT_VIEW, filters: DEFAULT_FILTERS, sort: v.sort, dir: v.dir, currency: v.currency, calc: v.calc }));
            }}
          >
            {ui.reset}
          </button>
        </div>
      </details>

      <div className="mdl-toolbar">
        <p role="status" aria-live="polite" className="t-label mdl-count">{fill(ui.count, { n: sorted.length, total: models.length })}</p>
        <div className="mdl-tools">
          {fx && (
            <div className="mdl-seg" role="group" aria-label={ui.currency} title={fill(ui.fxNote, { rate: Math.round(fx).toLocaleString(locale === "id" ? "id-ID" : "en-US"), date: data.fx?.date ?? "" })}>
              {(["USD", "IDR"] as const).map((c) => (
                <button key={c} type="button" aria-pressed={cur === c} onClick={() => setView((v) => ({ ...v, currency: c }))}>{c}</button>
              ))}
            </div>
          )}
          <div className="mdl-seg" role="group" aria-label={ui.columns}>
            <button type="button" aria-pressed={!allCols} onClick={() => setAllCols(false)}>{ui.columnsCompact}</button>
            <button type="button" aria-pressed={allCols} onClick={() => setAllCols(true)}>{ui.columnsAll}</button>
          </div>
          <label className="mdl-sort">
            <span className="t-label">{ui.sortBy}</span>
            <select value={view.sort} onChange={(e) => setView((v) => ({ ...v, sort: e.target.value as SortKey, page: 1 }))}>
              {sortOptions.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <button type="button" className="mdl-btn" onClick={() => setView((v) => ({ ...v, dir: v.dir === "asc" ? "desc" : "asc", page: 1 }))}>
              {view.dir === "asc" ? ui.asc : ui.desc}
            </button>
          </label>
          <button type="button" className="mdl-btn" onClick={exportCsv}>{ui.export}</button>
        </div>
      </div>

      <div className="mdl-calc">
        <label className="mdl-free">
          <input type="checkbox" checked={view.calc.on} onChange={(e) => setView((v) => ({ ...v, calc: { ...v.calc, on: e.target.checked } }))} />
          {ui.calcOn}
        </label>
        {view.calc.on && (
          <div className="mdl-calc-body">
            <p className="t-caption">{ui.calcTitle}. {ui.calcNote}</p>
            <div className="mdl-calc-inputs">
              <div>
                <label htmlFor="mdl-cin" className="t-label">{ui.calcIn}</label>
                <input id="mdl-cin" type="number" min="0" step="1" inputMode="decimal" value={view.calc.inM} onChange={(e) => setView((v) => ({ ...v, calc: { ...v.calc, inM: Math.max(0, Number(e.target.value) || 0) } }))} />
              </div>
              <div>
                <label htmlFor="mdl-cout" className="t-label">{ui.calcOut}</label>
                <input id="mdl-cout" type="number" min="0" step="1" inputMode="decimal" value={view.calc.outM} onChange={(e) => setView((v) => ({ ...v, calc: { ...v.calc, outM: Math.max(0, Number(e.target.value) || 0) } }))} />
              </div>
            </div>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <p role="status" className="mdl-status">{ui.empty}</p>
      ) : (
        <>
          <div className="mdl-scroll" role="region" aria-label={ui.title} tabIndex={0}>
            <table className="mdl-table">
              <thead>
                <tr>
                  {cols.map((c) => (
                    <th key={c.id} scope="col" className={c.num ? "mdl-num" : undefined} aria-sort={c.sort && view.sort === c.sort ? (view.dir === "asc" ? "ascending" : "descending") : undefined}>
                      {c.sort ? (
                        <button type="button" className="mdl-th" onClick={() => toggleSort(c.sort as SortKey)}>
                          {c.label}
                          <span aria-hidden="true">{view.sort === c.sort ? (view.dir === "asc" ? " ↑" : " ↓") : ""}</span>
                        </button>
                      ) : (
                        c.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((m) => (
                  <tr key={m.id}>
                    {cols.map((c) => (
                      <td key={c.id} className={c.num ? "mdl-num" : undefined}>{c.cell(m)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mdl-cards">
            {slice.map((m) => (
              <li key={m.id} className="mdl-card">
                <p className="mdl-id">{m.id}</p>
                <p className="t-caption">{[m.vendor, m.type, m.context ? compact(m.context) : null].filter(Boolean).join(" · ")}</p>
                <dl className="mdl-card-prices">
                  {SOURCES.map((s) => {
                    const mix = s === "OR" ? m.mixOr : s === "SP" ? m.mixSp : m.mixTk;
                    const c = costs(m, view.calc)[s];
                    return mix == null && c == null ? null : (
                      <div key={s} className={bestCode(m) === s ? "is-best" : undefined}>
                        <dt>{ui.sources[s]}</dt>
                        <dd>{fmt(view.calc.on ? c : mix) || "–"}</dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            ))}
          </ul>

          <nav className="mdl-pager" aria-label={ui.title}>
            <button type="button" className="mdl-btn" disabled={page <= 1} onClick={() => setView((v) => ({ ...v, page: page - 1 }))}>{ui.prev}</button>
            <span className="t-label">{fill(ui.pageOf, { p: page, n: pages })}</span>
            <button type="button" className="mdl-btn" disabled={page >= pages} onClick={() => setView((v) => ({ ...v, page: page + 1 }))}>{ui.next}</button>
          </nav>
        </>
      )}

      <p className="t-caption mdl-note">{ui.note}</p>
    </div>
  );
}
