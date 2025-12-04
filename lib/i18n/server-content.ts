import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationES from './locales/es.json';
import type { Locale } from '@/middleware';

type TranslationContent = typeof translationFR;

/**
 * Server-side content accessor for SEO
 * Returns content for the specified locale (for SSR/SEO)
 * This ensures all content is in the initial HTML for search engines
 */
const translations: Record<Locale, TranslationContent> = {
  fr: translationFR,
  en: translationEN,
  es: translationES,
};

export function getServerContent(locale: Locale): TranslationContent {
  return translations[locale] || translations.fr;
}

// Export default French for backward compatibility
export const serverContent = {
  hero: {
    title: translationFR.hero.title,
    subtitle: translationFR.hero.subtitle,
  },
  features: {
    title: translationFR.features.title,
    realtime: {
      title: translationFR.features.realtime.title,
      description: translationFR.features.realtime.description,
    },
    forecast: {
      title: translationFR.features.forecast.title,
      description: translationFR.features.forecast.description,
    },
    coverage: {
      title: translationFR.features.coverage.title,
      description: translationFR.features.coverage.description,
    },
  },
  screenshots: {
    title: translationFR.screenshots.title,
    buoyDetails: translationFR.screenshots.buoyDetails,
    map: translationFR.screenshots.map,
    forecast: translationFR.screenshots.forecast,
  },
  about: {
    title: translationFR.about.title,
    paragraph1: translationFR.about.paragraph1,
    paragraph2: translationFR.about.paragraph2,
    paragraph3: translationFR.about.paragraph3,
  },
  dataSources: {
    title: translationFR.dataSources.title,
    description: translationFR.dataSources.description,
    candhis: translationFR.dataSources.candhis,
    puertos: translationFR.dataSources.puertos,
    pml: translationFR.dataSources.pml,
    infraestruturas: translationFR.dataSources.infraestruturas,
    marine: translationFR.dataSources.marine,
    meteofrance: translationFR.dataSources.meteofrance,
    noaa: translationFR.dataSources.noaa,
  },
  cta: {
    title: translationFR.cta.title,
    subtitle: translationFR.cta.subtitle,
    downloadIOS: translationFR.cta.downloadIOS,
    downloadAndroid: translationFR.cta.downloadAndroid,
  },
  footer: {
    tagline: translationFR.footer.tagline,
    developer: translationFR.footer.developer,
    languages: translationFR.footer.languages,
    copyright: translationFR.footer.copyright,
  },
};
