import { Button } from "../Button";
import { Eyebrow } from "../Eyebrow";
import { Metric } from "../Metric";
import { StackTags } from "../StackTags";
import { site, type Home } from "@/lib/i18n";

export function About({ home }: { home: Home }) {
  const { about } = home;
  return (
    <section data-cosmos="nebula" id="about" aria-label={about.label} className="container-page section-gap anchor">
      <div data-reveal>
        <Eyebrow>{about.label}</Eyebrow>
        <div className="about-grid mt-8">
          <div>
          <div className="space-y-6">
          {about.paragraphs.map((p) => (
            <p key={p} data-dust="assemble" data-dust-state="pending" className="t-lead text-text-2">{p}</p>
          ))}
          </div>
          <div className="mt-10">
            <StackTags items={about.stack} />
          </div>
          {site.cvFile && (
            <Button variant="ghost" href={site.cvFile} download className="mt-10">
              {about.downloadCv}
            </Button>
          )}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, image is already web-sized */}
          <img src="/img/profile.jpg" width={853} height={1280} alt={about.photoAlt} loading="lazy" decoding="async" className="about-photo" />
        </div>
        <div className="mt-[var(--section-gap)]">
          <h3 className="t-h3">{about.practicesTitle}</h3>
          <ul className="practice-grid mt-10">
            {about.practices.map((pr) => (
              <li key={pr.title}>
                <p className="t-h4">{pr.title}</p>
                <p className="mt-3 text-text-2">{pr.text}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {about.scale.map((m) => (
              <li key={m.label}>
                <Metric value={m.value} label={m.label} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
