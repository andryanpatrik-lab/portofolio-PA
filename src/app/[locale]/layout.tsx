import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jetbrainsMono, spaceGrotesk } from "../fonts";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { Cosmos } from "@/components/cosmos/Cosmos";
import { CursorGlow } from "@/components/CursorGlow";
import { DustController } from "@/components/StardustText";
import { MOTION_INIT_SCRIPT } from "@/lib/motionInit";
import "../globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getDictionary(locale);
  return { metadataBase: new URL(siteUrl), ...buildMetadata({ locale, path: "", title: meta.title, description: meta.description }) };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_INIT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {getDictionary(locale).skipLink}
        </a>
        <Cosmos />
        <DustController />
        <CursorGlow />
        {/* Decorative: only shown during the black-hole page transition (src/lib/blackHole.ts) */}
        <div aria-hidden="true" className="bh-curtain" />
        <div aria-hidden="true" className="bh-portal" />
        {children}
      </body>
    </html>
  );
}
