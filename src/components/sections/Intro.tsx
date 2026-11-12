import { DisplayControls } from "../DisplayControls";
import type { Dictionary } from "@/lib/i18n";

/**
 * Cinematic entry (M10): a tall section with one sticky screen. Scrolling flies the camera through a gate
 * (see IntroFlight). Only rendered visibly when <html> has `intro-on` (see src/lib/motionInit.ts); otherwise
 * it is display:none and the hero is the first thing on the page. The layers are decorative; the text stays in the DOM.
 */
export function Intro({ dict }: { dict: Dictionary }) {
  return (
    <div className="intro" data-cosmos="nebula">
      <div className="intro-stick" data-intro="stick">
        <div aria-hidden="true" className="intro-layer intro-stars" data-intro="stars" />
        <div aria-hidden="true" className="intro-layer intro-dust intro-dust-a" data-intro="dust-a" />
        <div aria-hidden="true" className="intro-layer intro-dust intro-dust-b" data-intro="dust-b" />
        <div aria-hidden="true" className="intro-portal" data-intro="portal" />
        {/* the header is hidden during the intro, so the display controls live here too */}
        <div className="intro-controls" data-intro="controls">
          <DisplayControls text={dict.display} />
        </div>
        <a href="#hero" className="intro-skip t-label" data-intro="skip">
          {dict.intro.skip}
        </a>
        <div className="intro-copy" data-intro="copy">
          <p data-dust="assemble" data-dust-state="pending" className="intro-welcome">
            {dict.intro.welcome}
          </p>
          {/* the same line is the hero subtitle: hidden from assistive tech here so it is not read twice */}
          <p aria-hidden="true" className="t-lead text-text-2">{dict.hero.sub}</p>
          <p className="t-label intro-hint">
            {dict.intro.hint} <span aria-hidden="true">↓</span>
          </p>
        </div>
      </div>
    </div>
  );
}
