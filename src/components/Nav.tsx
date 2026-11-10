import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
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
      className="container-page relative z-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6"
    >
      <Link href={`/${locale}/`} className="t-h4 order-1">
        {dict.name.split(" ")[0]}
      </Link>
      <div className="order-2 sm:order-3">
        <LangToggle locale={locale} ariaLabel={dict.langToggle.ariaLabel} pathSuffix={pathSuffix} />
      </div>
      <nav aria-label={dict.navLabel} className="order-3 w-full sm:order-2 sm:ml-auto sm:w-auto">
        <ul className="t-label flex items-center gap-6 text-text-2 sm:gap-8">
          <li><a href={`${base}#work`}>{dict.nav.work}</a></li>
          <li><a href={`${base}#about`}>{dict.nav.about}</a></li>
          <li><a href={`${base}#contact`}>{dict.nav.contact}</a></li>
        </ul>
      </nav>
    </header>
  );
}
