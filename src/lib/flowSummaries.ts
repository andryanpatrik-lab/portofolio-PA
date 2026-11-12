import flowsId from "@content/id/flows.json";
import flowsEn from "@content/en/flows.json";
import type { FlowSummary } from "@/components/FlowExplorer";
import type { Locale } from "./i18n";
import type { FlowSlug, FlowUi } from "./flows";

type RawFlow = { title: string; desc: string; badge?: string; steps: number; stages: { title: string; desc: string }[] };
type Raw = { ui: unknown; groups: Record<string, string[]>; flows: Record<string, RawFlow> };
const raw: Record<Locale, Raw> = { id: flowsId as unknown as Raw, en: flowsEn as unknown as Raw };

/** Server-side only: titles, counts, and stage texts for the heading, the phone fallback, and the no-script summary. The heavy data loads lazily on the client. */
export function getFlowSummaries(locale: Locale, group: string): FlowSummary[] {
  const d = raw[locale];
  return (d.groups[group] ?? []).map((slug) => {
    const f = d.flows[slug];
    return { slug: slug as FlowSlug, title: f.title, desc: f.desc, badge: f.badge, steps: f.steps, stages: f.stages.map((s) => ({ title: s.title, desc: s.desc })) };
  });
}

/** Card slugs that have flows, in display order. */
export const flowGroupSlugs = (locale: Locale) => Object.keys(raw[locale].groups);

export function getFlowLabels(locale: Locale) {
  const ui = raw[locale].ui as FlowUi;
  return { pickFlow: ui.pickFlow, openFull: ui.openFull, loading: ui.loading, noScript: ui.noScript, hint: ui.hint, mobileNote: ui.mobileNote };
}

/** Every flow of every card, tagged with its card slug (for the full-screen explorer). */
export function getAllFlowSummaries(locale: Locale): FlowSummary[] {
  return flowGroupSlugs(locale).flatMap((group) => getFlowSummaries(locale, group).map((f) => ({ ...f, group })));
}
