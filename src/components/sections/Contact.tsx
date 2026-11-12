import { Button } from "../Button";
import { Eyebrow } from "../Eyebrow";
import { site, type Home } from "@/lib/i18n";

export function Contact({ home }: { home: Home }) {
  const { contact } = home;
  const waHref = site.whatsapp ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(contact.whatsappText)}` : "";
  const links = [
    { label: "Email", href: site.email ? `mailto:${site.email}` : "" },
    { label: "LinkedIn", href: site.linkedin },
    { label: "GitHub", href: site.github },
  ].filter((l) => l.href);

  return (
    <section data-cosmos="supernova" id="contact" aria-labelledby="contact-title" className="container-page section-gap anchor pb-[var(--section-gap)]">
      <div data-reveal>
        <Eyebrow>{contact.label}</Eyebrow>
        <h2 id="contact-title" data-dust="assemble" data-dust-state="pending" className="t-h1 mt-8">{contact.title}</h2>
        <p data-dust="assemble" data-dust-state="pending" className="t-lead mt-6 text-text-2">{contact.sub}</p>
        {site.email || waHref ? (
          <div className="mt-10 flex flex-wrap gap-4">
            {site.email && <Button href={`mailto:${site.email}`}>{contact.cta}</Button>}
            {waHref && (
              <Button variant="ghost" href={waHref} target="_blank" rel="noopener noreferrer">
                {contact.whatsapp}
                <span className="sr-only"> {contact.newTab}</span>
              </Button>
            )}
          </div>
        ) : (
          <p className="t-caption mt-10">{contact.pending}</p>
        )}
        {links.length > 0 && (
          <ul className="t-label mt-8 flex flex-wrap gap-x-8 gap-y-3 text-text-2">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} rel="noopener noreferrer" className="tap link-underline">{l.label}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
