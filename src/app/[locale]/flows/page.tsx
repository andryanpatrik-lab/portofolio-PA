import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { BlackHoleArrive } from "@/components/BlackHoleArrive";
import { FlowExplorer } from "@/components/FlowExplorer";
import { Footer } from "@/components/Footer";
import { LightMotes } from "@/components/LightMotes";
import { Nav } from "@/components/Nav";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { flowGroupSlugs, getAllFlowSummaries, getFlowLabels } from "@/lib/flowSummaries";
import { getDictionary, getHome, isLocale, locales } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Params = { locale: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return buildMetadata({ locale, path: "flows/", title: `${dict.case.exploreTitle} · ${dict.name}`, description: dict.case.exploreDesc });
}

export default async function FlowsPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const home = getHome(locale);
  const groups = flowGroupSlugs(locale).map((id) => ({ id, title: home.work.cards.find((c) => c.slug === id)?.title ?? id }));

  return (
    <div className="light-page">
      <BlackHoleArrive />
      <LightMotes />
      <RevealOnScroll />
      <Nav locale={locale} dict={dict} pathSuffix="flows/" />
      <main id="main" data-cosmos="aurora" className="container-page pb-[var(--section-gap)] pt-8">
        <BackLink href={`/${locale}/#work`} className="t-label tap text-text-2 link-underline">
          <span aria-hidden="true">← </span>
          {dict.case.back}
        </BackLink>
        <h1 className="t-h2 mt-8">{dict.case.exploreTitle}</h1>
        <p className="t-lead mt-4 max-w-[60ch] text-text-2">{dict.case.exploreNote}</p>
        <div className="mt-10">
          <FlowExplorer locale={locale} summaries={getAllFlowSummaries(locale)} groups={groups} labels={getFlowLabels(locale)} full />
        </div>
      </main>
      <Footer text={dict.footer} />
    </div>
  );
}
