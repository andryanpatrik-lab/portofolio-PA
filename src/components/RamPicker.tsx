"use client";

import { useId, useMemo, useState } from "react";
import { byPopularity, fits, maxParams, type OllamaModel, type OllamaSettings } from "@/lib/ollamaFit";
import type { Dictionary, Locale } from "@/lib/i18n";

/** Slide to a RAM size and see which Ollama models fit. Pure client state, no motion. */
export function RamPicker({ ui, locale, settings, models }: { ui: Dictionary["case"]["ollama"]; locale: Locale; settings: OllamaSettings; models: OllamaModel[] }) {
  const [ram, setRam] = useState(settings.ramGb);
  const id = useId();
  const nf = useMemo(() => new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", { maximumFractionDigits: 1 }), [locale]);
  const result = useMemo(() => models.filter((m) => fits(m, ram, settings)).sort(byPopularity), [models, ram, settings]);
  const limit = maxParams(ram, settings);

  return (
    <div className="ollama-picker mt-4">
      <p className="t-caption">{ui.pickerNote}</p>
      <div className="ollama-range">
        <label htmlFor={id} className="t-label">
          {ui.pickerRam}: <strong className="text-text">{ram} {ui.pickerGb}</strong>
        </label>
        <input id={id} type="range" min={2} max={64} step={1} value={ram} onChange={(e) => setRam(Number(e.target.value))} />
      </div>
      <p className="t-lead text-text-2" aria-live="polite">
        {result.length > 0 ? ui.pickerResult.replace("{p}", nf.format(limit)).replace("{n}", String(result.length)) : ui.pickerNone}
      </p>
      {result.length > 0 && (
        <ul className="ollama-chips">
          {result.slice(0, 8).map((m, i) => (
            <li key={`${m.name}-${m.size}-${i}`}>
              {m.name}
              {m.size ? ` ${m.size}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
