import { notFound } from "next/navigation";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { HeroMotion } from "@/components/HeroMotion";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { OtherWork } from "@/components/sections/OtherWork";
import { Position } from "@/components/sections/Position";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { getDictionary, getHome, isLocale } from "@/lib/i18n";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const home = getHome(locale);
  return (
    <>
      <HeroMotion />
      <RevealOnScroll />
      <Nav locale={locale} dict={dict} />
      <main>
        <Hero dict={dict} home={home} />
        <Position home={home} />
        <SelectedWork home={home} />
        <OtherWork home={home} />
        <About home={home} />
        <Contact home={home} />
      </main>
      <Footer text={dict.footer} />
    </>
  );
}
