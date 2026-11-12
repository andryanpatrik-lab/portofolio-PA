import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { DisplayControls } from "./DisplayControls";
import { LangToggle } from "./LangToggle";

/**
 * Site header. `home` marks the home page: in-page anchors stay local and the hero reveal drives the nav fade.
 * `pathSuffix` is the current page path under the locale ("" or "work/<slug>/"), so the language toggle stays on the same page.
 */
export function Nav({
  locale,
  dict,
  home = false,
  pathSuffix = "",
}: {
  locale: Locale;
  dict: Dictionary;
  home?: boolean;
  pathSuffix?: string;
}) {
  const base = home ? "" : `/${locale}/`;
  return (
    <header
      data-hero={home ? "nav" : undefined}
      data-nav={home ? "" : undefined}
      className="container-page relative z-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-6 sm:gap-x-8"
    >
      <Link href={`/${locale}/`} className="t-h4 tap order-1">
        {dict.name}
      </Link>
      <div className="order-2 sm:order-3">
        <LangToggle locale={locale} ariaLabel={dict.langToggle.ariaLabel} pathSuffix={pathSuffix} />
      </div>
      {/* On phones the display controls share the second row with the menu; from sm up everything sits in one row */}
      <div className="order-3 flex w-full items-center justify-between sm:order-2 sm:ml-auto sm:w-auto sm:gap-8">
        <nav aria-label={dict.navLabel}>
          <ul className="t-label flex items-center gap-6 text-text-2 sm:gap-8">
            <li><a href={`${base}#work`} className="tap">{dict.nav.work}</a></li>
            <li><a href={`${base}#about`} className="tap">{dict.nav.about}</a></li>
            <li><a href={`${base}#contact`} className="tap">{dict.nav.contact}</a></li>
          </ul>
        </nav>
        <DisplayControls text={dict.display} />
      </div>
    </header>
  );
}
