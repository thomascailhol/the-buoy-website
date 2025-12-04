import type { Metadata } from "next";
import { getServerContent } from "@/lib/i18n/server-content";
import { locales, defaultLocale, type Locale } from "@/middleware";
import { I18nProvider } from "@/components/I18nProvider";
import LocaleScript from "@/components/LocaleScript";

type Props = {
  params: Promise<{ locale: Locale }> | { locale: Locale };
  children: React.ReactNode;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  const content = getServerContent(locale);

  // Build hreflang alternates
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    alternates[loc] = `https://labouee.app/${loc}`;
  });

  return {
    metadataBase: new URL("https://labouee.app"),
    title: {
      default: content.hero.title + " | La Bouée",
      template: "%s | La Bouée",
    },
    description: content.hero.subtitle,
    keywords: [
      "surf",
      "bouées",
      "vagues",
      "houle",
      "prévisions surf",
      "météo surf",
      "conditions surf",
      "application surf",
      "widgets surf",
      "surf conditions",
      "wave buoy",
      "marine data",
      "surf forecast",
      "wave height",
      "swell period",
      "surf app",
    ],
    authors: [{ name: "Thomas Cailhol" }],
    creator: "Thomas Cailhol",
    publisher: "La Bouée",
    alternates: {
      canonical: `https://labouee.app/${locale}`,
      languages: alternates,
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : locale === "en" ? "en_US" : "es_ES",
      url: `https://labouee.app/${locale}`,
      siteName: "La Bouée",
      title: content.hero.title,
      description: content.hero.subtitle,
      images: [
        {
          url: "/assets/screenshot-1.png",
          width: 1200,
          height: 630,
          alt: "La Bouée - Application de conditions de surf",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.hero.title,
      description: content.hero.subtitle,
      images: ["/assets/screenshot-1.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      // Add hreflang tags
      "x-default": `https://labouee.app/${locale}`,
      ...locales.reduce((acc, loc) => {
        acc[`alternate-hreflang-${loc}`] = `https://labouee.app/${loc}`;
        return acc;
      }, {} as Record<string, string>),
    },
  };
}

export default async function LocaleLayout({ params, children }: Props) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  const content = getServerContent(locale);

  return (
    <>
      {/* Structured Data - WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "La Bouée",
            url: `https://labouee.app/${locale}`,
            description: content.hero.subtitle,
            inLanguage: locale,
            publisher: {
              "@type": "Organization",
              name: "La Bouée",
              url: "https://labouee.app/",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `https://labouee.app/${locale}/bouees?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      {/* Structured Data - MobileApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MobileApplication",
            name: locale === "fr" ? "La Bouée" : locale === "en" ? "The Buoy" : "La Boia",
            applicationCategory: "SportsApplication",
            operatingSystem: "iOS, Android",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.5",
            },
          }),
        }}
      />
      <LocaleScript locale={locale} />
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </>
  );
}

