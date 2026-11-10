import { Button } from "../Button";
import { Eyebrow } from "../Eyebrow";
import type { Dictionary, Home } from "@/lib/i18n";

export function Hero({ dict, home }: { dict: Dictionary; home: Home }) {
  return (
    <section aria-labelledby="hero-title" className="container-page pt-16 md:pt-28">
      <Eyebrow>{dict.hero.label}</Eyebrow>
      <h1 id="hero-title" className="t-display mt-8 max-w-[14ch]">
        {home.hero.titleBefore}
        <span className="text-accent">{home.hero.accent}</span>
        {home.hero.titleAfter}
      </h1>
      <p className="t-lead mt-8 text-text-2">{dict.hero.sub}</p>
      <Button href="#work" className="mt-12">
        {home.hero.cta} <span aria-hidden="true">↓</span>
      </Button>
    </section>
  );
}
