import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";
import { isProduction } from "./site";

const ogLocale: Record<Locale, string> = { id: "id_ID", en: "en_US" };
const siteName = "Patrik Andryan";

/** Metadata shared by the home and case study pages: canonical, hreflang, Open Graph, Twitter, indexing. */
export function buildMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const image = { url: "/og.png", width: 1200, height: 630, alt: `${siteName} · Business Systems & Automation Lead` };
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/${path}`,
      languages: { id: `/id/${path}`, en: `/en/${path}`, "x-default": `/id/${path}` },
    },
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: `/${locale}/${path}`,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    robots: isProduction ? undefined : { index: false, follow: false },
  };
}
