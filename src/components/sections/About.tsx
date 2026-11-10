import { Button } from "../Button";
import { Eyebrow } from "../Eyebrow";
import { StackTags } from "../StackTags";
import { site, type Home } from "@/lib/i18n";

export function About({ home }: { home: Home }) {
  const { about } = home;
  return (
    <section data-cosmos="nebula" id="about" aria-label={about.label} className="container-page section-gap anchor">
      <div data-reveal>
        <Eyebrow>{about.label}</Eyebrow>
        <div className="mt-8 space-y-6">
          {about.paragraphs.map((p) => (
            <p key={p} data-split className="t-lead text-text-2">{p}</p>
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
    </section>
  );
}
