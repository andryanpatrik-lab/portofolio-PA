import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlackHoleArrive } from "@/components/BlackHoleArrive";
import { CaseStudyLayout } from "@/components/CaseStudyLayout";
import { Footer } from "@/components/Footer";
import { LightMotes } from "@/components/LightMotes";
import { Nav } from "@/components/Nav";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { buildMetadata } from "@/lib/seo";
import { getDictionary, getHome, getOtherProject, isLocale, locales, otherProjectIds } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => otherProjectIds.map((id) => ({ locale, id })));
}

type Params = { locale: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};
  const item = getHome(locale).other.items.find((i) => i.id === id);
  if (!item) return {};
  return buildMetadata({
    locale,
    path: `projects/${id}/`,
    title: `${item.name} · ${getDictionary(locale).name}`,
    description: item.summary,
  });
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const home = getHome(locale);
  const items = home.other.items;
  const index = items.findIndex((i) => i.id === id);
  const data = getOtherProject(locale, id);
  if (index < 0 || !data) notFound();

  const item = items[index];
  const nextItem = items[(index + 1) % items.length];
  const dict = getDictionary(locale);

  return (
    <div className="light-page">
      <BlackHoleArrive />
      <LightMotes />
      <RevealOnScroll />
      <Nav locale={locale} dict={dict} pathSuffix={`projects/${id}/`} />
      <CaseStudyLayout
        variant="project"
        locale={locale}
        dict={dict}
        slug={id}
        index={index}
        total={items.length}
        title={item.name}
        tagline={item.summary}
        data={data}
        next={{ slug: nextItem.id, title: nextItem.name }}
        backHref={`/${locale}/#other`}
        nextHref={`/${locale}/projects/${nextItem.id}/`}
        counterLabel={home.other.title}
      />
      <Footer text={dict.footer} />
    </div>
  );
}
