import { RamPicker } from "./RamPicker";
import { SystemSheet } from "./SystemSheet";
import { getOllama, ollamaSettings, ollamaStats } from "@/lib/ollama";
import { budgetGb, byPopularity, maxParams, neededGb } from "@/lib/ollamaFit";
import type { Dictionary, Locale } from "@/lib/i18n";

type Ui = Dictionary["case"]["ollama"];

const TOP = 25;

/**
 * Test specification of the offline AI experiment: the test device (from content/ollama-test.json) and the Ollama models that fit in it
 * (from public/data/ollama.json, written at build time). Server-rendered and static; the long tail sits in a native <details>.
 * Model names are shown as they are on purpose (explicit exception for this page, see CLAUDE.md M43).
 */
export function OllamaSpec({ locale, ui }: { locale: Locale; ui: Ui }) {
  const s = ollamaSettings;
  const { status, updatedAt, models } = getOllama();
  const { total, fitting } = ollamaStats(models);
  const ranked = [...fitting].sort(byPopularity);
  const nf = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", { maximumFractionDigits: 1 });
  const compact = new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", { notation: "compact", maximumFractionDigits: 1 });
  const dust = { "data-dust": "assemble", "data-dust-state": "pending" } as const;

  const items = [
    { value: nf.format(s.ramGb), label: ui.ram, note: ui.ramNote },
    { value: nf.format(budgetGb(s.ramGb, s)), label: ui.budget, note: ui.budgetNote },
    { value: nf.format(maxParams(s.ramGb, s)), label: ui.limit, note: ui.limitNote },
    ...(total > 0
      ? [
          { value: String(total), label: ui.scanned, note: ui.scannedNote },
          { value: String(fitting.length), label: ui.fitting, note: ui.fittingNote },
        ]
      : []),
  ];

  const row = (m: (typeof ranked)[number], i: number) => (
    <tr key={`${m.name}-${m.size}-${i}`}>
      <th scope="row">{m.name}</th>
      <td>{m.size ?? "—"}</td>
      <td>{m.params != null ? `${nf.format(neededGb(m.params, s))} GB` : "—"}</td>
      <td>{m.cap ?? "—"}</td>
      <td>{m.pulls != null ? compact.format(m.pulls) : "—"}</td>
    </tr>
  );
  const head = (
    <thead>
      <tr>
        <th scope="col">{ui.colModel}</th>
        <th scope="col">{ui.colSize}</th>
        <th scope="col">{ui.colRam}</th>
        <th scope="col">{ui.colCap}</th>
        <th scope="col">{ui.colPulls}</th>
      </tr>
    </thead>
  );

  return (
    <section data-cosmos="nebula" className="mt-[var(--section-gap)]">
      <h2 {...dust} className="t-h3">{ui.specTitle}</h2>
      <p {...dust} className="t-lead mt-6 max-w-[60ch] text-text-2">{ui.specNote}</p>
      <SystemSheet items={items} />

      {ranked.length > 0 ? (
        <>
          <h3 className="t-label mt-14">{ui.fitList}</h3>
          <div className="ollama-wrap mt-4">
            <table className="ollama-table">
              {head}
              <tbody>{ranked.slice(0, TOP).map(row)}</tbody>
            </table>
          </div>
          {ranked.length > TOP && (
            <details className="ollama-more mt-4">
              <summary className="t-label tap">{ui.showAll.replace("{n}", String(ranked.length))}</summary>
              <div className="ollama-wrap mt-4">
                <table className="ollama-table">
                  {head}
                  <tbody>{ranked.slice(TOP).map(row)}</tbody>
                </table>
              </div>
            </details>
          )}
          <p className="t-caption mt-4">
            {status === "stale" ? ui.stale : ui.updated}
            {updatedAt && `: ${new Date(updatedAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}`}
          </p>

          <h3 className="t-label mt-14">{ui.pickerTitle}</h3>
          <RamPicker
            ui={ui}
            locale={locale}
            settings={s}
            models={models.filter((m) => m.params != null).map(({ name, size, params, pulls }) => ({ name, size, params, ram: null, cap: null, pulls }))}
          />
        </>
      ) : (
        <p className="t-caption mt-6">{ui.noData}</p>
      )}
    </section>
  );
}
