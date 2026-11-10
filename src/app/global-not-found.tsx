import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, locales } from "@/lib/i18n";
import { jetbrainsMono, spaceGrotesk } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 · Patrik Andryan",
  robots: { index: false, follow: false },
};

// The root layout lives under [locale], so unmatched URLs get this standalone, bilingual page.
export default function GlobalNotFound() {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>
        <main className="container-page flex min-h-screen flex-col justify-center gap-12 py-24">
          <p className="t-label text-accent">404</p>
          <div className="grid gap-12 md:grid-cols-2">
            {locales.map((locale) => {
              const dict = getDictionary(locale);
              return (
                <section key={locale} lang={locale}>
                  <h1 className="t-h2">{dict.notFound.title}</h1>
                  <Link href={`/${locale}/`} className="t-label link-underline mt-6 inline-block text-text-2">
                    {dict.notFound.link}
                  </Link>
                </section>
              );
            })}
          </div>
        </main>
      </body>
    </html>
  );
}
