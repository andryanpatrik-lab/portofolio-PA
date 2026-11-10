import id from "@content/id/common.json";
import en from "@content/en/common.json";

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
