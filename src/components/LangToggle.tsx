import Link from "next/link";
import { locales, type Locale } from "@/lib/i18n";

export function LangToggle({ locale, ariaLabel, pathSuffix = "" }: { locale: Locale; ariaLabel: string; pathSuffix?: string }) {
  return (
    <div role="group" aria-label={ariaLabel} className="t-label flex items-center gap-2">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true" className="text-text-muted">/</span>}
          <Link
            href={`/${l}/${pathSuffix}`}
            hrefLang={l}
            lang={l}
            aria-current={l === locale ? "true" : undefined}
            className={l === locale ? "text-accent" : "text-text-muted hover:text-text"}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
