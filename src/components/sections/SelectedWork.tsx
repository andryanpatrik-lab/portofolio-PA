import { Eyebrow } from "../Eyebrow";
import { ProjectCard } from "../ProjectCard";
import type { Home, Locale } from "@/lib/i18n";

export function SelectedWork({ home, locale }: { home: Home; locale: Locale }) {
  const { work } = home;
  return (
    <section data-cosmos="aurora" id="work" aria-label={work.label} className="container-page section-gap anchor">
      <Eyebrow>{work.label}</Eyebrow>
      <h2 className="sr-only">{work.title}</h2>
      <div className="mt-10 flex flex-col gap-6 md:gap-8">
        {work.cards.map((card, i) => (
          <ProjectCard
            key={card.slug}
            href={`/${locale}/work/${card.slug}/`}
            slug={card.slug}
            number={String(i + 1).padStart(2, "0")}
            title={card.title}
            tagline={card.tagline}
            flowSteps={card.flowSteps}
            metricValue={card.metric.value}
            estimateLabel={work.estimateLabel}
            isEstimate={card.metric.estimate}
            scopeLabel={work.scopeLabel}
            isScope={card.metric.scope}
          />
        ))}
      </div>
    </section>
  );
}
