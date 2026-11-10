import type { CSSProperties } from "react";

/**
 * Flow diagram built from plain HTML/CSS so every animation is transform/opacity only.
 * "mini" is decorative (cards): numbered nodes joined by lines, no labels.
 * A labelled "full" variant is added with the case study template (M3).
 */
export function FlowDiagram({ steps, variant }: { steps: number; variant: "mini" }) {
  return (
    <div aria-hidden="true" className={`flow flow-${variant}`}>
      {Array.from({ length: steps }, (_, i) => {
        const last = i === steps - 1;
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
