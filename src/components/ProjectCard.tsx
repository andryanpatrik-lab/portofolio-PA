import Link from "next/link";
import { ViewTransition } from "react";
import { FlowDiagram } from "./FlowDiagram";
import { Metric } from "./Metric";

export function ProjectCard({
  href,
  slug,
  number,
  title,
  tagline,
  flowSteps,
  metricValue,
  estimateLabel,
  isEstimate,
}: {
  href: string;
  slug: string;
  number: string;
  title: string;
  tagline: string;
  flowSteps: number;
  metricValue: string;
  estimateLabel: string;
  isEstimate: boolean;
}) {
  return (
    <Link
      href={href}
      transitionTypes={["bh-enter"]}
      className="block rounded-2xl"
    >
      <article data-reveal className="project-card rounded-2xl border border-border bg-bg p-6 md:p-12">
        <ViewTransition name={`card-num-${slug}`} share="morph" default="none">
          <p className="t-label inline-block text-accent">{number}</p>
        </ViewTransition>
        <ViewTransition name={`card-title-${slug}`} share="morph" default="none">
          <h3 className="t-h2 mt-6 max-w-[20ch]">{title}</h3>
        </ViewTransition>
        <p className="t-lead mt-6 text-text-2">{tagline}</p>
        <ViewTransition name={`card-flow-${slug}`} share="morph" default="none">
          <div className="mt-10 max-w-md">
            <FlowDiagram variant="mini" steps={flowSteps} />
          </div>
        </ViewTransition>
        <div className="mt-6 flex items-end justify-between gap-6">
          <div>
            <Metric value={metricValue} size="sm" />
            {isEstimate && <p className="t-label mt-2 text-text-muted">{estimateLabel}</p>}
          </div>
          <span aria-hidden="true" className="card-arrow inline-block t-h3 text-accent">→</span>
        </div>
      </article>
    </Link>
  );
}
