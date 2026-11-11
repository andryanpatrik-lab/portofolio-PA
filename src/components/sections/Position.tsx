import { CountMetric } from "../CountMetric";
import { Eyebrow } from "../Eyebrow";
import type { Home } from "@/lib/i18n";

export function Position({ home }: { home: Home }) {
  const { position } = home;
  return (
    <section data-cosmos="nebula" aria-label={position.label} className="container-page section-gap">
      <div data-reveal>
        <Eyebrow dust>{position.label}</Eyebrow>
        <p data-dust="assemble" data-dust-state="pending" className="t-lead mt-8 text-text">{position.lead}</p>
      </div>
      <ul className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
        {position.metrics.map((m, i) => (
          <li key={m.label} data-reveal>
            <CountMetric value={m.value} unit={m.unit} label={m.label} order={i} dust />
          </li>
        ))}
      </ul>
    </section>
  );
}
