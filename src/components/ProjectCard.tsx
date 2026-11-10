import { FlowDiagram } from "./FlowDiagram";
import { Metric } from "./Metric";

export function ProjectCard({
  number,
  title,
  tagline,
  flowSteps,
  metricValue,
  estimateLabel,
  isEstimate,
}: {
  number: string;
  title: string;
  tagline: string;
  flowSteps: number;
  metricValue: string;
  estimateLabel: string;
  isEstimate: boolean;
}) {
  return (
    <article data-reveal className="project-card rounded-2xl border border-border bg-bg p-6 md:p-12">
      <p className="t-label text-accent">{number}</p>
      <h3 className="t-h2 mt-6 max-w-[20ch]">{title}</h3>
      <p className="t-lead mt-6 text-text-2">{tagline}</p>
      <div className="mt-10 max-w-md">
        <FlowDiagram steps={flowSteps} variant="mini" />
      </div>
      <div className="mt-6 flex items-end justify-between gap-6">
        <div>
          <Metric value={metricValue} size="sm" />
          {isEstimate && <p className="t-label mt-2 text-text-muted">{estimateLabel}</p>}
        </div>
        <span aria-hidden="true" className="card-arrow inline-block t-h3 text-accent">→</span>
      </div>
    </article>
  );
}
