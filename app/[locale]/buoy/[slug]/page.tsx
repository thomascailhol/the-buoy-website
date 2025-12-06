import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchBuoyBySlug, type Buoy } from "@/lib/api/buoys";
import { locales, defaultLocale, type Locale } from "@/middleware";
import {
  BuoyNavigation,
  BuoyHero,
  BuoyInformation,
  BuoyCTA,
  ReadingsTable,
} from "./components";
import { generateBuoyMetadata } from "./utils/metadata";
import { generateStructuredData } from "./utils/structured-data";

// Use ISR: page is cached and revalidated every 60 seconds
// This dramatically improves TTFB while keeping data reasonably fresh
// The readings table inside uses Suspense with no-store for real-time data
export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: string; per_page?: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  const locale = (
    locales.includes(localeParam as Locale) ? localeParam : defaultLocale
  ) as Locale;

  const buoy = await fetchBuoyBySlug(slug);

  return generateBuoyMetadata({ buoy, locale, slug });
}

export default async function BuoyDetailPage({ params, searchParams }: Props) {
  const { locale: localeParam, slug } = await params;
  const { page, per_page } = await searchParams;

  const locale = (
    locales.includes(localeParam as Locale) ? localeParam : defaultLocale
  ) as Locale;

  // Only fetch the main buoy data synchronously - this is needed for the page shell
  const buoy = await fetchBuoyBySlug(slug);

  if (!buoy) {
    notFound();
  }

  // Ensure lat/lng are numbers
  const lat = typeof buoy.lat === "string" ? parseFloat(buoy.lat) : buoy.lat;
  const lng = typeof buoy.lng === "string" ? parseFloat(buoy.lng) : buoy.lng;

  const reading = buoy.last_reading;
  const lastUpdate = reading?.time ? new Date(reading.time) : null;

  // Parse page number from search params, default to 1
  const currentPage = page ? parseInt(page, 10) : 1;
  const validPage = currentPage > 0 ? currentPage : 1;

  // Parse per_page from search params, default to 20, validate against allowed values
  const allowedPerPage = [10, 20, 50, 100];
  const parsedPerPage = per_page ? parseInt(per_page, 10) : 20;
  const validPerPage = allowedPerPage.includes(parsedPerPage)
    ? parsedPerPage
    : 20;

  return (
    <main className="min-h-screen bg-background">
      <BuoyNavigation locale={locale} />

      <BuoyHero buoy={buoy} locale={locale} />

      {/* Main Content */}
      <section className="pt-2 pb-8">
        {/* Readings History Table - has internal Suspense for table rows */}
        <div className="container max-w-5xl mx-auto px-4">
          <ReadingsTable
            buoyId={buoy.id}
            locale={locale}
            page={validPage}
            perPage={validPerPage}
            slug={slug}
            timezone={buoy.dtz}
          />
        </div>

        {/* Information Section */}
        <div className="container max-w-5xl mx-auto px-4">
          <BuoyInformation buoy={buoy} locale={locale} lat={lat} lng={lng} />
        </div>

        {/* CTA Section */}
        <div className="container max-w-5xl mx-auto px-4">
          <BuoyCTA locale={locale} />
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateStructuredData({
            buoy,
            locale,
            slug,
            lat,
            lng,
          }),
        }}
      />
    </main>
  );
}
