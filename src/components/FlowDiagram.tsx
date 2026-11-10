import type { CSSProperties } from "react";

type FlowStep = { label: string; note?: string };

type Props = { variant: "mini"; steps: number } | { variant: "full"; steps: FlowStep[] };

/**
 * Flow diagram built from plain HTML/CSS so every animation is transform/opacity only.
 * "mini" is decorative (cards): numbered nodes joined by lines, no labels.
 * "full" is the labelled version used on case study pages.
 */
export function FlowDiagram(props: Props) {
  if (props.variant === "full") {
    const steps = props.steps;
    return (
      <ol className="flow-full" style={{ "--n": steps.length } as CSSProperties}>
        {steps.map((step, i) => (
          <li key={step.label} className="flow-full-step">
            <span aria-hidden="true" className="flow-full-node" />
            {i < steps.length - 1 && <span aria-hidden="true" className="flow-full-line" />}
            <span className="flow-full-num t-label" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="flow-full-label">{step.label}</p>
            {step.note && <p className="t-caption mt-1">{step.note}</p>}
          </li>
        ))}
      </ol>
    );
  }

  const count = props.steps;
  return (
    <div aria-hidden="true" className="flow flow-mini">
      {Array.from({ length: count }, (_, i) => {
        const last = i === count - 1;
        return (
          <div key={i} className="flow-step" style={{ "--i": i } as CSSProperties}>
            <span className="flow-node">
              <span className="flow-node-fill" />
            </span>
            {!last && (
              <span className="flow-line">
                <span className="flow-line-fill" />
              </span>
            )}
            <span className={`flow-num t-label ${last ? "flow-num-last" : ""}`}>{String(i + 1).padStart(2, "0")}</span>
          </div>
        );
      })}
    </div>
  );
}
