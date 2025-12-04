import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Screenshots from '@/components/Screenshots';
import About from '@/components/About';
import DataSources from '@/components/DataSources';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getServerContent } from '@/lib/i18n/server-content';
import type { Locale } from '@/middleware';

type Props = {
  params: Promise<{ locale: Locale }> | { locale: Locale };
};

export async function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'es' }];
}

export default async function Home({ params }: Props) {
  // Handle both Promise and direct params (Next.js 15+ compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  
  // Content is server-rendered via getServerContent in components
  // This ensures SEO content is in the initial HTML
  
  return (
    <main className="min-h-screen overflow-x-hidden">
      <LanguageSwitcher currentLocale={locale} />
      <Hero locale={locale} />
      <Screenshots locale={locale} />
      <Features locale={locale} />
      <About locale={locale} />
      <DataSources locale={locale} />
      <CTA locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}

