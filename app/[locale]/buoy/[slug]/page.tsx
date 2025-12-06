import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchBuoyBySlug, type Buoy } from "@/lib/api/buoys";
import { locales, defaultLocale, type Locale } from "@/middleware";
import {
  BuoyNavigation,
  BuoyHero,
  BuoyInformation,
  BuoyCTA,
  NearbyBuoys,
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

// Component that fetches and renders buoy-dependent content
async function BuoyContent({
  slug,
  locale,
  page,
  perPage,
}: {
  slug: string;
  locale: Locale;
  page: number;
  perPage: number;
}) {
  const buoy = await fetchBuoyBySlug(slug);

  if (!buoy) {
    notFound();
  }

  // Ensure lat/lng are numbers
  const lat = typeof buoy.lat === "string" ? parseFloat(buoy.lat) : buoy.lat;
  const lng = typeof buoy.lng === "string" ? parseFloat(buoy.lng) : buoy.lng;

  return (
    <>
      <BuoyHero buoy={buoy} locale={locale} />

      {/* Main Content */}
      <section className="pt-2 pb-8">
        {/* Readings History Table - has internal Suspense for table rows */}
        <div className="container max-w-5xl mx-auto px-4">
          <ReadingsTable
            buoyId={buoy.id}
            locale={locale}
            page={page}
            perPage={perPage}
            slug={slug}
            timezone={buoy.dtz}
          />
        </div>

        {/* Information Section */}
        <div className="container max-w-5xl mx-auto px-4">
          <BuoyInformation buoy={buoy} locale={locale} lat={lat} lng={lng} />
        </div>

        {/* Nearby Buoys Section */}
        <div className="container max-w-5xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="bg-card border rounded-xl p-6 mb-8 animate-pulse">
                <div className="h-6 w-48 bg-muted rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="h-5 w-32 bg-muted rounded mb-2" />
                      <div className="h-4 w-24 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <NearbyBuoys
              lat={lat}
              lng={lng}
              locale={locale}
              currentBuoyId={buoy.id}
              maxDistance={200}
              limit={5}
            />
          </Suspense>
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
    </>
  );
}

export default async function BuoyDetailPage({ params, searchParams }: Props) {
  const { locale: localeParam, slug } = await params;
  const { page, per_page } = await searchParams;

  const locale = (
    locales.includes(localeParam as Locale) ? localeParam : defaultLocale
  ) as Locale;

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
      {/* Navigation renders immediately - doesn't need buoy data */}
      <BuoyNavigation locale={locale} />

      {/* Buoy content wrapped in Suspense - shows loading state while fetching */}
      <Suspense
        key={`buoy-${slug}`}
        fallback={
          <>
            {/* Hero Section Skeleton */}
            <header className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
              <div className="container max-w-5xl mx-auto animate-pulse">
                <div className="mb-4">
                  <div className="h-10 md:h-12 lg:h-14 w-64 md:w-80 bg-muted rounded mb-3" />
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted rounded" />
                    <div className="h-5 w-48 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded" />
                  <div className="h-4 w-64 bg-muted rounded" />
                </div>
                <div className="mt-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
              </div>
            </header>
            {/* Main Content Skeleton */}
            <section className="py-8">
              <div className="container max-w-5xl mx-auto px-4">
                <div className="bg-muted/50 border rounded-xl p-6 mb-8 animate-pulse">
                  <div className="h-6 w-48 bg-muted rounded mb-4" />
                  <div className="space-y-4">
                    <div>
                      <div className="h-5 w-40 bg-muted rounded mb-2" />
                      <div className="h-4 w-full bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        }
      >
        <BuoyContent
          slug={slug}
          locale={locale}
          page={validPage}
          perPage={validPerPage}
        />
      </Suspense>
    </main>
  );
}
