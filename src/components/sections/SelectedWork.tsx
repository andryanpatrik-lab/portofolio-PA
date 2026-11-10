import { Eyebrow } from "../Eyebrow";
import { ProjectCard } from "../ProjectCard";
import type { Home } from "@/lib/i18n";

export function SelectedWork({ home }: { home: Home }) {
  const { work } = home;
  return (
    <section id="work" aria-label={work.label} className="container-page section-gap anchor">
      <Eyebrow>{work.label}</Eyebrow>
      <div className="mt-10 flex flex-col gap-6 md:gap-8">
        {work.cards.map((card, i) => (
          <ProjectCard
            key={card.slug}
            number={String(i + 1).padStart(2, "0")}
            title={card.title}
            tagline={card.tagline}
            flowSteps={card.flowSteps}
            metricValue={card.metric.value}
            estimateLabel={work.estimateLabel}
            isEstimate={card.metric.estimate}
          />
        ))}
      </div>
    </section>
  );
}
