import { ViewTransition } from "react";
import { BackLink } from "./BackLink";
import { BlackHoleLink } from "./BlackHoleLink";
import { FlowDiagram } from "./FlowDiagram";
import { Metric } from "./Metric";
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
};

export function CaseStudyLayout({ locale, dict, slug, index, total, title, tagline, data, next }: Props) {
  const ui = dict.case;
  const number = String(index + 1).padStart(2, "0");
  const cosmos = (["aurora", "nebula", "ember", "supernova"] as const)[index % 4];
  const meta = [data.role, data.year, data.status, data.stack.join(", ")].filter(Boolean);

  const dust = { "data-dust": "assemble", "data-dust-state": "pending" } as const;

  // Each section picks a colour mood for the light background (the section under the viewport centre decides, see Cosmos).
  const section = (heading: string, mood: string, body?: string) => (
    <section data-cosmos={mood} className="mt-[var(--section-gap)]">
      <h2 {...dust} className="t-h3">{heading}</h2>
      <p {...dust} className={`t-lead mt-6 ${body ? "text-text-2" : "text-text-muted"}`}>{body ?? ui.pending}</p>
    </section>
  );

  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <main id="main" data-cosmos={cosmos} className="page-enter container-page pb-[var(--section-gap)] pt-8">
        <div className="flex items-center justify-between">
          <BackLink href={`/${locale}/#work`} className="t-label tap text-text-2 link-underline">
            <span aria-hidden="true">← </span>
            {ui.back}
          </BackLink>
          <p className="t-label text-text-muted">
            <ViewTransition name={`card-num-${slug}`} share="morph" default="none">
              <span className="inline-block text-accent">{number}</span>
            </ViewTransition>{" "}
            / {String(total).padStart(2, "0")}
          </p>
        </div>

        <header className="mt-16 md:mt-24">
          <ViewTransition name={`card-title-${slug}`} share="morph" default="none">
            <h1 className="t-h1 max-w-[18ch]">{title}</h1>
          </ViewTransition>
          <p {...dust} className="t-lead mt-6 text-text-2">{tagline}</p>
          {meta.length > 0 && <p className="t-label mt-6 text-text-muted">{meta.join(" · ")}</p>}
        </header>

        {data.context && (
          <section data-cosmos="aurora" className="mt-[var(--section-gap)]">
            <h2 {...dust} className="t-h3">{ui.context}</h2>
            <p {...dust} className="t-lead mt-6 text-text-2">{data.context}</p>
          </section>
        )}

        {section(ui.problem, "ember", data.problem)}

        <section data-cosmos="nebula" className="mt-[var(--section-gap)]">
          <h2 {...dust} className="t-h3">{ui.solution}</h2>
          <p {...dust} className={`t-lead mt-6 ${data.solution ? "text-text-2" : "text-text-muted"}`}>{data.solution ?? ui.pending}</p>
          <ViewTransition name={`card-flow-${slug}`} share="morph" default="none">
            <div className="mt-12">
              <FlowDiagram variant="full" steps={data.flow} />
            </div>
          </ViewTransition>
        </section>

        {data.workflows && data.workflows.length > 0 && (
          <section data-cosmos="aurora" className="mt-[var(--section-gap)]">
            <h2 {...dust} className="t-h3">{ui.workflows}</h2>
            <ul className="mt-10 space-y-4">
              {data.workflows.map((w) => (
                <li key={w.name} className="wf-li">
                  <details className="wf-item rounded-xl border border-border p-5 md:p-6">
                    <summary className="wf-summary">
                      <span className="t-h4 block">{w.name}</span>
                      <span className="t-label mt-2 block text-text-muted">{ui.trigger}: {w.trigger}</span>
                    </summary>
                    <p className="mt-6 text-text-2">{w.summary}</p>
                    <div className="mt-8">
                      <FlowDiagram variant="full" steps={w.flow} />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.system && data.system.length > 0 && (
          <section data-cosmos="nebula" className="mt-[var(--section-gap)]">
            <h2 {...dust} className="t-h3">{ui.system}</h2>
            <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
              {data.system.map((m) => (
                <li key={m.label}>
                  <Metric value={m.value} label={m.label} size="sm" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section data-cosmos="supernova" className="mt-[var(--section-gap)]">
          <h2 {...dust} className="t-h3">{ui.results}</h2>
          <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            {data.metrics.filter((m) => m.value !== "—").map((m, i) => (
              <li key={i} className={m.value.length > 12 ? "sm:col-span-3" : undefined}>
                <Metric value={m.value} label={m.label} />
                {m.estimate && <p className="t-label mt-2 text-text-muted">{ui.estimate}</p>}
              </li>
            ))}
          </ul>
        </section>

        {data.learning && section(ui.learning, "void", data.learning)}

        <nav aria-label={ui.next} className="mt-[var(--section-gap)] border-t border-border pt-10">
          <BlackHoleLink href={`/${locale}/work/${next.slug}/`} className="block">
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
