import { Eyebrow } from "../Eyebrow";
import { BlackHoleLink } from "../BlackHoleLink";
import { OtherProjectCard } from "../OtherProjectCard";
import type { Home, Locale } from "@/lib/i18n";

export function OtherWork({ home, locale }: { home: Home; locale: Locale }) {
  const { other } = home;
  return (
    <section id="other" data-cosmos="ember" aria-labelledby="other-title" className="container-page section-gap">
      <div data-reveal>
        <Eyebrow>{other.label}</Eyebrow>
        <h2 id="other-title" data-dust="assemble" data-dust-state="pending" className="t-h2 mt-8">{other.title}</h2>
        <p data-dust="assemble" data-dust-state="pending" className="t-lead mt-4 text-text-2">{other.sub}</p>
      </div>
      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {other.items.map((item) => (
          <li key={item.id} data-reveal className="other-item">
            <BlackHoleLink href={`/${locale}/projects/${item.id}/`} className="block h-full rounded-xl">
              <OtherProjectCard
                name={item.name}
                summary={item.summary}
                tags={item.tags}
                status={item.status}
              />
            </BlackHoleLink>
          </li>
        ))}
      </ul>
      <div data-reveal className="mt-8">
        <BlackHoleLink href={`/${locale}/models/`} className="other-tool block rounded-xl border border-border p-6">
          <span className="t-label text-text-muted">{other.tool.label}</span>
          <span className="t-h4 mt-2 block">
            {other.tool.title} <span aria-hidden="true" className="text-accent">→</span>
          </span>
          <span className="mt-2 block max-w-[62ch] text-text-2">{other.tool.desc}</span>
        </BlackHoleLink>
      </div>
    </section>
  );
}
