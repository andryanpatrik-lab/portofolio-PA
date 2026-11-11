import { Button } from "../Button";
import { Eyebrow } from "../Eyebrow";
import { site, type Home } from "@/lib/i18n";

export function Contact({ home }: { home: Home }) {
  const { contact } = home;
  const links = [
    { label: "Email", href: site.email ? `mailto:${site.email}` : "" },
    { label: "LinkedIn", href: site.linkedin },
    { label: "GitHub", href: site.github },
  ].filter((l) => l.href);

  return (
    <section data-cosmos="supernova" id="contact" aria-labelledby="contact-title" className="container-page section-gap anchor pb-[var(--section-gap)]">
      <div data-reveal>
        <Eyebrow>{contact.label}</Eyebrow>
        <h2 id="contact-title" data-dust="assemble" className="t-h1 mt-8">{contact.title}</h2>
        <p data-dust="assemble" className="t-lead mt-6 text-text-2">{contact.sub}</p>
        {site.email ? (
          <Button href={`mailto:${site.email}`} className="mt-10">{contact.cta}</Button>
        ) : (
          <p className="t-caption mt-10">{contact.pending}</p>
        )}
        {links.length > 0 && (
          <ul className="t-label mt-8 flex flex-wrap gap-x-8 gap-y-3 text-text-2">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} rel="noopener noreferrer" className="link-underline">{l.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
