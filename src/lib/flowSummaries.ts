import flowsId from "@content/id/flows.json";
import flowsEn from "@content/en/flows.json";
import type { FlowSummary } from "@/components/FlowExplorer";
import type { Locale } from "./i18n";
import type { FlowSlug, FlowUi } from "./flows";

type Raw = { ui: unknown; order: string[]; flows: Record<string, { title: string; desc: string; steps: number }> };
const raw: Record<Locale, Raw> = { id: flowsId as unknown as Raw, en: flowsEn as unknown as Raw };

/** Server-side only: titles and counts for the section heading and the no-script summary. The heavy data loads lazily on the client. */
export function getFlowSummaries(locale: Locale): FlowSummary[] {
  const d = raw[locale];
  return d.order.map((slug) => ({ slug: slug as FlowSlug, title: d.flows[slug].title, desc: d.flows[slug].desc, steps: d.flows[slug].steps }));
}

export function getFlowLabels(locale: Locale) {
  const ui = raw[locale].ui as FlowUi;
  return { pickFlow: ui.pickFlow, openFull: ui.openFull, loading: ui.loading, noScript: ui.noScript, hint: ui.hint };
}
