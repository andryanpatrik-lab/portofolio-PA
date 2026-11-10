import { Eyebrow } from "../Eyebrow";
import { OtherProjectCard } from "../OtherProjectCard";
import type { Home } from "@/lib/i18n";

export function OtherWork({ home }: { home: Home }) {
  const { other } = home;
  return (
    <section aria-labelledby="other-title" className="container-page section-gap">
      <Eyebrow>{other.label}</Eyebrow>
      <h2 id="other-title" className="t-h2 mt-8">{other.title}</h2>
      <p className="t-lead mt-4 text-text-2">{other.sub}</p>
      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {other.items.map((item) => (
          <li key={item.id}>
            <OtherProjectCard
              name={item.name}
              summary={item.summary}
              tags={item.tags}
              status={item.status ?? other.statusPending}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
