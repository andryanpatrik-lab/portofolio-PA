import type { MetadataRoute } from "next";
import { caseStudySlugs, locales, otherProjectIds } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...caseStudySlugs.map((slug) => `work/${slug}/`), ...otherProjectIds.map((id) => `projects/${id}/`), "flows/", "models/"];
  return paths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/${path}`,
      alternates: {
        languages: { id: `${siteUrl}/id/${path}`, en: `${siteUrl}/en/${path}` },
      },
    })),
  );
}
