import { Button } from "../Button";
import { Eyebrow } from "../Eyebrow";
import type { Dictionary, Home } from "@/lib/i18n";

export function Hero({ dict, home }: { dict: Dictionary; home: Home }) {
  return (
    <section data-cosmos="void" aria-labelledby="hero-title" className="relative isolate overflow-x-clip pt-16 md:pt-28">
      <div data-hero="glow" aria-hidden="true" className="hero-glow pointer-events-none absolute inset-x-0 -top-32 bottom-0 -z-10" />
      <div className="container-page">
        <div data-hero="label">
          <Eyebrow>{dict.hero.label}</Eyebrow>
        </div>
        <h1 id="hero-title" data-hero="title" data-dust="dissolve" className="t-display mt-8 max-w-[14ch]">
          {home.hero.titleBefore}
          {/* Keyword is drawn in two layers so the white-to-gold shift animates opacity only. */}
          <span className="relative inline-block">
            <span className="accent-base">{home.hero.accent}</span>
            <span aria-hidden="true" data-hero="gold" className="absolute inset-0 text-accent">
              {home.hero.accent}
            </span>
          </span>
          {home.hero.titleAfter}
        </h1>
        <p data-hero="rest" className="t-lead mt-8 text-text-2">{dict.hero.sub}</p>
        <Button href="#work" data-hero="rest" className="mt-12">
          {home.hero.cta} <span aria-hidden="true">↓</span>
        </Button>
      </div>
    </section>
  );
}
