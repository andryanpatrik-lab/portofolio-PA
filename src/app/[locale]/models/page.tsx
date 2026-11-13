import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { BlackHoleArrive } from "@/components/BlackHoleArrive";
import { Footer } from "@/components/Footer";
import { LightMotes } from "@/components/LightMotes";
import { ModelExplorer } from "@/components/ModelExplorer";
import { Nav } from "@/components/Nav";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import modelsId from "@content/id/models.json";
import modelsEn from "@content/en/models.json";

export const dynamicParams = false;

const texts: Record<Locale, typeof modelsId> = { id: modelsId, en: modelsEn };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: "models/", title: `${texts[locale].title} · ${getDictionary(locale).name}`, description: texts[locale].lead });
}

export default async function ModelsPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const ui = texts[locale];

  return (
    <div className="light-page">
      <BlackHoleArrive />
      <LightMotes />
      <RevealOnScroll />
      <Nav locale={locale} dict={dict} pathSuffix="models/" />
      <main id="main" data-cosmos="nebula" className="container-page pb-[var(--section-gap)] pt-8">
        <BackLink href={`/${locale}/#other`} className="t-label tap text-text-2 link-underline">
          <span aria-hidden="true">← </span>
          {dict.case.back}
        </BackLink>
        <h1 className="t-h2 mt-8">{ui.title}</h1>
        <p className="t-lead mt-4 max-w-[62ch] text-text-2">{ui.lead}</p>
        <div className="mt-10">
          <ModelExplorer ui={ui} locale={locale} />
          <noscript>
            <p className="t-caption">{ui.noScript}</p>
          </noscript>
        </div>
      </main>
      <Footer text={dict.footer} />
    </div>
  );
}
