import id from "@content/id/common.json";
import en from "@content/en/common.json";
import homeId from "@content/id/home.json";
import homeEn from "@content/en/home.json";
import caseId from "@content/id/case-studies.json";
import caseEn from "@content/en/case-studies.json";
import otherId from "@content/id/other-projects.json";
import otherEn from "@content/en/other-projects.json";
import site from "@content/site.json";

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];

export type Dictionary = typeof id;

const dictionaries: Record<Locale, Dictionary> = { id, en };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type Home = typeof homeId;

const homes: Record<Locale, Home> = { id: homeId, en: homeEn };

export function getHome(locale: Locale): Home {
  return homes[locale];
}

export { site };

export type CaseStudyData = {
  role?: string;
  year: string;
  status?: string;
  stack: string[];
  context?: string;
  problem?: string;
  solution?: string;
  flow: { label: string; note?: string }[];
  metrics: { value: string; label?: string; estimate?: boolean }[];
  learning?: string;
  system?: { value: string; label: string }[];
};

const caseStudies: Record<Locale, Record<string, CaseStudyData>> = { id: caseId, en: caseEn };

export const caseStudySlugs: string[] = homeId.work.cards.map((c) => c.slug);

export function getCaseStudy(locale: Locale, slug: string): CaseStudyData | undefined {
  return caseStudies[locale][slug];
}

// "Other work" detail pages reuse the case study data shape; most fields are optional there.
const otherProjects: Record<Locale, Record<string, CaseStudyData>> = {
  id: otherId as unknown as Record<string, CaseStudyData>,
  en: otherEn as unknown as Record<string, CaseStudyData>,
};

export const otherProjectIds: string[] = homeId.other.items.map((item) => item.id);

export function getOtherProject(locale: Locale, id: string): CaseStudyData | undefined {
  return otherProjects[locale][id];
}
