import Hero from '@/components/Hero';
import BuoysMap from '@/components/BuoysMap';
import Features from '@/components/Features';
import Screenshots from '@/components/Screenshots';
import About from '@/components/About';
import DataSources from '@/components/DataSources';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { locales, defaultLocale, type Locale } from '@/middleware';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }, { locale: 'es' }];
}

export default async function Home({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = (locales.includes(localeParam as Locale) ? localeParam : defaultLocale) as Locale;
  
  // Content is server-rendered via getServerContent in components
  // This ensures SEO content is in the initial HTML
  
  return (
    <main className="min-h-screen overflow-x-hidden">
      <LanguageSwitcher currentLocale={locale} />
      <Hero locale={locale} />
      <BuoysMap />
      <Screenshots locale={locale} />
      <Features locale={locale} />
      <About locale={locale} />
      <DataSources locale={locale} />
      <CTA locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}

