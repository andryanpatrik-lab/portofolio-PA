import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlackHoleArrive } from "@/components/BlackHoleArrive";
import { CaseStudyLayout } from "@/components/CaseStudyLayout";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { buildMetadata } from "@/lib/seo";
import { caseStudySlugs, getCaseStudy, getDictionary, getHome, isLocale, locales } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => caseStudySlugs.map((slug) => ({ locale, slug })));
}

type Params = { locale: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const card = getHome(locale).work.cards.find((c) => c.slug === slug);
  if (!card) return {};
  return buildMetadata({
    locale,
    path: `work/${slug}/`,
    title: `${card.title} · ${getDictionary(locale).name}`,
    description: card.tagline,
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const home = getHome(locale);
  const index = home.work.cards.findIndex((c) => c.slug === slug);
  const data = getCaseStudy(locale, slug);
  if (index < 0 || !data) notFound();

  const card = home.work.cards[index];
  const nextCard = home.work.cards[(index + 1) % home.work.cards.length];
  const dict = getDictionary(locale);

  return (
    // Case studies are the light pages (M12): the wrapper re-scopes the colour tokens (see .light-page in globals.css).
    <div className="light-page">
      <BlackHoleArrive />
      <RevealOnScroll />
      <Nav locale={locale} dict={dict} pathSuffix={`work/${slug}/`} />
      <CaseStudyLayout
        locale={locale}
        dict={dict}
        slug={slug}
        index={index}
        total={home.work.cards.length}
        title={card.title}
        tagline={card.tagline}
        data={data}
        next={{ slug: nextCard.slug, title: nextCard.title }}
      />
      <Footer text={dict.footer} />
    </div>
  );
}
