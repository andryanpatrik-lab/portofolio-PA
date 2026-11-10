import { Eyebrow } from "../Eyebrow";
import { Metric } from "../Metric";
import type { Home } from "@/lib/i18n";

export function Position({ home }: { home: Home }) {
  const { position } = home;
  return (
    <section data-cosmos="nebula" aria-label={position.label} className="container-page section-gap">
      <div data-reveal>
        <Eyebrow>{position.label}</Eyebrow>
        <p data-split className="t-lead mt-8 text-text">{position.lead}</p>
      </div>
      <ul className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
        {position.metrics.map((m) => (
          <li key={m.label} data-reveal>
            <Metric value={m.value} label={m.label} />
          </li>
        ))}
      </ul>
    </section>
  );
}
