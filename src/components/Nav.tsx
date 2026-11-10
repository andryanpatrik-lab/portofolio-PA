import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

export function Nav({ locale, dict, heroReveal = false }: { locale: Locale; dict: Dictionary; heroReveal?: boolean }) {
  return (
    <header data-hero={heroReveal ? "nav" : undefined} className="container-page relative z-10 flex items-center justify-between py-6">
      <Link href={`/${locale}/`} className="t-h4">
        {dict.name.split(" ")[0]}
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-8">
        <ul className="t-label hidden items-center gap-8 text-text-2 sm:flex">
          <li><a href="#work">{dict.nav.work}</a></li>
          <li><a href="#about">{dict.nav.about}</a></li>
          <li><a href="#contact">{dict.nav.contact}</a></li>
        </ul>
        <LangToggle locale={locale} ariaLabel={dict.langToggle.ariaLabel} />
      </nav>
    </header>
  );
}
