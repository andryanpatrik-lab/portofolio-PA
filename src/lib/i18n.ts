import id from "@content/id/common.json";
import en from "@content/en/common.json";
import homeId from "@content/id/home.json";
import homeEn from "@content/en/home.json";
import site from "@content/site.json";

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";

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
