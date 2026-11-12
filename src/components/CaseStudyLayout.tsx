import { ViewTransition } from "react";
import { BackLink } from "./BackLink";
import { BlackHoleLink } from "./BlackHoleLink";
import { FlowAnimOnScroll } from "./FlowAnimOnScroll";
import { FlowDiagram } from "./FlowDiagram";
import { FlowExplorer } from "./FlowExplorer";
import { Metric } from "./Metric";
import { SystemSheet } from "./SystemSheet";
import { getFlowLabels, getFlowSummaries } from "@/lib/flowSummaries";
import type { CaseStudyData, Dictionary, Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  dict: Dictionary;
  slug: string;
  index: number;
  total: number;
  title: string;
  tagline: string;
  data: CaseStudyData;
  next: { slug: string; title: string };
  /**
   * "work" is one of the four main case studies (counter, card morph, placeholder text for missing sections).
   * "project" is a page for an "Other work" project: sections without data are simply not rendered.
   */
  variant?: "work" | "project";
  backHref?: string;
  nextHref?: string;
  /** Text shown top right instead of the "01 / 04" counter (project variant). */
  counterLabel?: string;
};

export function CaseStudyLayout({ locale, dict, slug, index, total, title, tagline, data, next, variant = "work", backHref, nextHref, counterLabel }: Props) {
  const project = variant === "project";
  const ui = dict.case;
  const number = String(index + 1).padStart(2, "0");
  const cosmos = (["aurora", "nebula", "ember", "supernova"] as const)[index % 4];
  const meta = [data.role, data.year, data.status, data.stack.join(", ")].filter(Boolean);

  const flows = getFlowSummaries(locale, slug);
  const shownMetrics = data.metrics.filter((m) => m.value !== "—");
  const dust = { "data-dust": "assemble", "data-dust-state": "pending" } as const;

  // Each section picks a colour mood for the light background (the section under the viewport centre decides, see Cosmos).
  const section = (heading: string, mood: string, body?: string) =>
    project && !body ? null : (
    <section data-cosmos={mood} className="mt-[var(--section-gap)]">
      <h2 {...dust} className="t-h3">{heading}</h2>
      <p {...dust} className={`t-lead mt-6 ${body ? "text-text-2" : "text-text-muted"}`}>{body ?? ui.pending}</p>
    </section>
    );

  // Card-to-page morph names only exist for the main case studies.
  const morph = (name: string, node: React.ReactNode) =>
    project ? node : (
      <ViewTransition name={`${name}-${slug}`} share="morph" default="none">
        {node}
      </ViewTransition>
    );

  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <FlowAnimOnScroll />
      <main id="main" data-cosmos={cosmos} className="page-enter container-page pb-[var(--section-gap)] pt-8">
        <div className="flex items-center justify-between">
          <BackLink href={backHref ?? `/${locale}/#work`} className="t-label tap text-text-2 link-underline">
            <span aria-hidden="true">← </span>
            {ui.back}
          </BackLink>
          {project ? (
            <p className="t-label text-text-muted">{counterLabel}</p>
          ) : (
            <p className="t-label text-text-muted">
              {morph("card-num", <span className="inline-block text-accent">{number}</span>)} / {String(total).padStart(2, "0")}
            </p>
          )}
        </div>

        <header className="mt-16 md:mt-24">
          {morph("card-title", <h1 className="t-h1 max-w-[18ch]">{title}</h1>)}
          <p {...dust} className="t-lead mt-6 text-text-2">{tagline}</p>
          {meta.length > 0 && <p className="t-label mt-6 text-text-muted">{meta.join(" · ")}</p>}
        </header>

        {flows.length > 0 && (
          <section data-cosmos="nebula" className="mt-12 md:mt-16">
            <h2 {...dust} className="t-h3">{ui.explore}</h2>
            <p {...dust} className="t-lead mt-6 max-w-[60ch] text-text-2">{ui.exploreNote}</p>
            <div className="mt-10">
              <FlowExplorer locale={locale} summaries={flows} labels={getFlowLabels(locale)} fullHref={`/${locale}/flows/#alur=${flows[0].slug}`} />
            </div>
          </section>
        )}

        {data.context && (
          <section data-cosmos="aurora" className="mt-[var(--section-gap)]">
            <h2 {...dust} className="t-h3">{ui.context}</h2>
            <p {...dust} className="t-lead mt-6 text-text-2">{data.context}</p>
          </section>
        )}

        {section(ui.problem, "ember", data.problem)}

        {(!project || data.solution || data.flow.length > 0) && (
          <section data-cosmos="nebula" className="mt-[var(--section-gap)]">
            <h2 {...dust} className="t-h3">{project && !data.problem ? ui.built : ui.solution}</h2>
            {(!project || data.solution) && (
              <p {...dust} className={`t-lead mt-6 ${data.solution ? "text-text-2" : "text-text-muted"}`}>{data.solution ?? ui.pending}</p>
            )}
            {data.flow.length > 0 &&
              morph(
                "card-flow",
                <div className="mt-12">
                  <FlowDiagram variant="full" steps={data.flow} />
                </div>,
              )}
          </section>
        )}

        {data.system && data.system.length > 0 && (
          <section data-cosmos="nebula" className="mt-[var(--section-gap)]">
            <h2 {...dust} className="t-h3">{ui.system}</h2>
            <SystemSheet items={data.system} />
          </section>
        )}

        {(!project || shownMetrics.length > 0) && (
          <section data-cosmos="supernova" className="mt-[var(--section-gap)]">
            <h2 {...dust} className="t-h3">{ui.results}</h2>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
              {shownMetrics.map((m, i) => (
                <li key={i} className={m.value.length > 12 ? "sm:col-span-3" : undefined}>
                  <Metric value={m.value} label={m.label} />
                  {m.estimate && <p className="t-label mt-2 text-text-muted">{ui.estimate}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.learning && section(ui.learning, "void", data.learning)}

        <nav aria-label={ui.next} className="mt-[var(--section-gap)] border-t border-border pt-10">
          <BlackHoleLink href={nextHref ?? `/${locale}/work/${next.slug}/`} className="block">
            <span className="t-label text-text-muted">{ui.next}</span>
            <span className="t-h3 mt-3 block max-w-[24ch]">
              {next.title} <span aria-hidden="true" className="text-accent">→</span>
            </span>
          </BlackHoleLink>
        </nav>
      </main>
    </ViewTransition>
  );
}
