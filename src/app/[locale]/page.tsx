import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { getDictionary, isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  return (
    <>
      <Nav locale={locale} dict={dict} />
      <main className="container-page py-[var(--section-gap)]">
        <p className="t-label text-text-muted">{dict.hero.label}</p>
        <h1 className="t-display mt-6">{dict.name}</h1>
        <p className="t-lead mt-6 text-text-2">{dict.hero.sub}</p>
      </main>
    </>
  );
}
