import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchBuoyBySlug, getDirectionLabel, type Buoy } from '@/lib/api/buoys';
import { locales, defaultLocale, type Locale } from '@/middleware';
import { getServerContent } from '@/lib/i18n/server-content';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { ReadingsTable, NearbyBuoysSection, NearbySpotsSection } from './components';
import { ReadingsTableSkeleton, NearbyBuoysSkeleton, NearbySpotsSkeleton } from './skeletons';

// This makes the page dynamic - data is fetched fresh on each request
// But still server-rendered for SEO (content is in HTML)
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = (locales.includes(localeParam as Locale) ? localeParam : defaultLocale) as Locale;
  
  const buoy = await fetchBuoyBySlug(slug);
  
  if (!buoy) {
    return {
      title: 'Buoy Not Found',
    };
  }

  const content = getServerContent(locale);
  const reading = buoy.last_reading;
  
  const titleByLocale: Record<Locale, string> = {
    fr: `Bouée ${buoy.name} - Données Météo Marine | La Bouée`,
    en: `${buoy.name} Buoy - Marine Weather Data | The Buoy`,
    es: `Boya ${buoy.name} - Datos Meteorológicos Marinos | La Boya`,
  };

  const descriptionByLocale: Record<Locale, string> = {
    fr: `Consultez les données en temps réel de la bouée ${buoy.name} : hauteur des vagues ${reading?.significient_height?.toFixed(1) || 'N/A'}m, période ${reading?.period?.toFixed(1) || 'N/A'}s${reading?.water_temperature ? `, température de l'eau ${reading.water_temperature.toFixed(1)}°C` : ''}.`,
    en: `View real-time data from ${buoy.name} buoy: wave height ${reading?.significient_height?.toFixed(1) || 'N/A'}m, period ${reading?.period?.toFixed(1) || 'N/A'}s${reading?.water_temperature ? `, water temperature ${reading.water_temperature.toFixed(1)}°C` : ''}.`,
    es: `Consulte los datos en tiempo real de la boya ${buoy.name}: altura de olas ${reading?.significient_height?.toFixed(1) || 'N/A'}m, período ${reading?.period?.toFixed(1) || 'N/A'}s${reading?.water_temperature ? `, temperatura del agua ${reading.water_temperature.toFixed(1)}°C` : ''}.`,
  };

  return {
    title: titleByLocale[locale],
    description: descriptionByLocale[locale],
    alternates: {
      canonical: `https://labouee.app/${locale}/buoy/${slug}`,
      languages: {
        fr: `https://labouee.app/fr/buoy/${slug}`,
        en: `https://labouee.app/en/buoy/${slug}`,
        es: `https://labouee.app/es/buoy/${slug}`,
      },
    },
    openGraph: {
      title: titleByLocale[locale],
      description: descriptionByLocale[locale],
      url: `https://labouee.app/${locale}/buoy/${slug}`,
      type: 'website',
    },
  };
}

export default async function BuoyDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  const locale = (locales.includes(localeParam as Locale) ? localeParam : defaultLocale) as Locale;
  
  // Only fetch the main buoy data synchronously - this is needed for the page shell
  const buoy = await fetchBuoyBySlug(slug);
  
  if (!buoy) {
    notFound();
  }

  // Ensure lat/lng are numbers
  const lat = typeof buoy.lat === 'string' ? parseFloat(buoy.lat) : buoy.lat;
  const lng = typeof buoy.lng === 'string' ? parseFloat(buoy.lng) : buoy.lng;

  const content = getServerContent(locale);
  const reading = buoy.last_reading;
  const lastUpdate = reading?.time ? new Date(reading.time) : null;
  const directionLabel = reading?.direction ? getDirectionLabel(reading.direction) : null;

  // Translations
  const t: Record<Locale, {
    backToHome: string;
    buoyTitle: string;
    lastUpdate: string;
    waveHeight: string;
    maxHeight: string;
    period: string;
    direction: string;
    waterTemp: string;
    noData: string;
    aboutBuoy: string;
    location: string;
    locationDesc: string;
    dataDesc: string;
    dataMeasured: string;
    source: string;
    viewOtherBuoys: string;
    exploreOtherBuoys: string;
    downloadApp: string;
    recentReadings: string;
    last24Hours: string;
    time: string;
    noReadings: string;
    nearbyBuoys: string;
    nearbySpots: string;
    kmAway: string;
    noNearbyBuoys: string;
    noNearbySpots: string;
    viewBuoy: string;
  }> = {
    fr: {
      backToHome: 'Retour à l\'accueil',
      buoyTitle: 'Bouée',
      lastUpdate: 'Dernière mise à jour',
      waveHeight: 'Hauteur',
      maxHeight: 'Hauteur max',
      period: 'Période',
      direction: 'Direction',
      waterTemp: 'Température eau',
      noData: 'Données non disponibles',
      aboutBuoy: 'À propos de cette bouée',
      location: 'Localisation géographique',
      locationDesc: 'mesure en continu les paramètres océanographiques essentiels pour la pratique du surf et des sports nautiques.',
      dataDesc: 'Cette station marine enregistre la hauteur significative des vagues, la hauteur maximale, la période des vagues, la direction de la houle et la température de l\'eau.',
      dataMeasured: 'Données mesurées',
      source: 'Source',
      viewOtherBuoys: 'Voir les autres bouées',
      exploreOtherBuoys: 'Explorez les données de toutes les bouées marines disponibles',
      downloadApp: 'Téléchargez l\'app pour accéder à toutes les données',
      recentReadings: 'Historique des mesures',
      last24Hours: 'Dernières 24 heures',
      time: 'Heure',
      noReadings: 'Aucune mesure disponible pour les dernières 24 heures',
      nearbyBuoys: 'Bouées à proximité',
      nearbySpots: 'Spots à proximité',
      kmAway: 'km',
      noNearbyBuoys: 'Aucune bouée à proximité',
      noNearbySpots: 'Aucun spot à proximité',
      viewBuoy: 'Voir la bouée',
    },
    en: {
      backToHome: 'Back to home',
      buoyTitle: 'Buoy',
      lastUpdate: 'Last updated',
      waveHeight: 'Wave height',
      maxHeight: 'Max height',
      period: 'Period',
      direction: 'Direction',
      waterTemp: 'Water temperature',
      noData: 'Data not available',
      aboutBuoy: 'About this buoy',
      location: 'Geographic location',
      locationDesc: 'continuously measures essential oceanographic parameters for surfing and water sports.',
      dataDesc: 'This marine station records significant wave height, maximum height, wave period, swell direction, and water temperature.',
      dataMeasured: 'Measured data',
      source: 'Source',
      viewOtherBuoys: 'View other buoys',
      exploreOtherBuoys: 'Explore data from all available marine buoys',
      downloadApp: 'Download the app to access all data',
      recentReadings: 'Reading History',
      last24Hours: 'Last 24 hours',
      time: 'Time',
      noReadings: 'No readings available for the last 24 hours',
      nearbyBuoys: 'Nearby Buoys',
      nearbySpots: 'Nearby Spots',
      kmAway: 'km',
      noNearbyBuoys: 'No nearby buoys found',
      noNearbySpots: 'No nearby spots found',
      viewBuoy: 'View buoy',
    },
    es: {
      backToHome: 'Volver al inicio',
      buoyTitle: 'Boya',
      lastUpdate: 'Última actualización',
      waveHeight: 'Altura de ola',
      maxHeight: 'Altura máxima',
      period: 'Período',
      direction: 'Dirección',
      waterTemp: 'Temperatura del agua',
      noData: 'Datos no disponibles',
      aboutBuoy: 'Acerca de esta boya',
      location: 'Ubicación geográfica',
      locationDesc: 'mide continuamente los parámetros oceanográficos esenciales para el surf y los deportes acuáticos.',
      dataDesc: 'Esta estación marina registra la altura significativa de las olas, la altura máxima, el período de las olas, la dirección del oleaje y la temperatura del agua.',
      dataMeasured: 'Datos medidos',
      source: 'Fuente',
      viewOtherBuoys: 'Ver otras boyas',
      exploreOtherBuoys: 'Explore los datos de todas las boyas marinas disponibles',
      downloadApp: 'Descarga la app para acceder a todos los datos',
      recentReadings: 'Historial de mediciones',
      last24Hours: 'Últimas 24 horas',
      time: 'Hora',
      noReadings: 'No hay mediciones disponibles para las últimas 24 horas',
      nearbyBuoys: 'Boyas cercanas',
      nearbySpots: 'Spots cercanos',
      kmAway: 'km',
      noNearbyBuoys: 'No se encontraron boyas cercanas',
      noNearbySpots: 'No se encontraron spots cercanos',
      viewBuoy: 'Ver boya',
    },
  };

  const text = t[locale];

  // Translations object to pass to async components
  const translations = {
    recentReadings: text.recentReadings,
    last24Hours: text.last24Hours,
    time: text.time,
    waveHeight: text.waveHeight,
    maxHeight: text.maxHeight,
    period: text.period,
    direction: text.direction,
    waterTemp: text.waterTemp,
    noReadings: text.noReadings,
    nearbyBuoys: text.nearbyBuoys,
    nearbySpots: text.nearbySpots,
    kmAway: text.kmAway,
    noNearbyBuoys: text.noNearbyBuoys,
    noNearbySpots: text.noNearbySpots,
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <Link 
            href={`/${locale}`} 
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {text.backToHome}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
              {text.buoyTitle} {buoy.name}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <p className="text-lg">
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° {lng >= 0 ? 'E' : 'W'}
              </p>
            </div>
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p>
                {text.lastUpdate}: {lastUpdate.toLocaleString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          )}
          {buoy.source && (
            <div className="mt-2 text-sm text-muted-foreground">
              {text.source}: <span className="font-medium">{buoy.source}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8">
        {/* Readings History Table - Suspense boundary */}
        <div className="container max-w-5xl mx-auto px-4">
          <Suspense fallback={<ReadingsTableSkeleton />}>
            <ReadingsTable 
              buoyId={buoy.id} 
              locale={locale} 
              translations={translations}
            />
          </Suspense>
        </div>

        {/* Nearby Buoys & Spots - Suspense boundaries */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Nearby Buoys */}
            <Suspense fallback={<NearbyBuoysSkeleton />}>
              <NearbyBuoysSection 
                lat={lat} 
                lng={lng} 
                currentBuoyId={buoy.id}
                locale={locale}
                translations={translations}
              />
            </Suspense>

            {/* Nearby Spots */}
            <Suspense fallback={<NearbySpotsSkeleton />}>
              <NearbySpotsSection 
                lat={lat} 
                lng={lng}
                translations={translations}
              />
            </Suspense>
          </div>
        </div>

        {/* Information Section */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="bg-muted/50 border rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{text.aboutBuoy}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{text.location}</h3>
                <p className="text-sm text-muted-foreground">
                  {text.buoyTitle} {buoy.name} {text.locationDesc} (
                  {lat.toFixed(6)}° lat, {lng.toFixed(6)}° lng)
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{text.dataMeasured}</h3>
                <p className="text-sm text-muted-foreground">
                  {text.dataDesc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="bg-primary/5 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{text.viewOtherBuoys}</h2>
            <p className="text-muted-foreground mb-6">
              {text.exploreOtherBuoys}
            </p>
            <Link 
              href={`/${locale}#buoys-map`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
            >
              {text.viewOtherBuoys}
            </Link>
          </div>
        </div>
      </section>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${text.buoyTitle} ${buoy.name} - ${locale === 'fr' ? 'Données en temps réel' : locale === 'es' ? 'Datos en tiempo real' : 'Real-time data'}`,
            url: `https://labouee.app/${locale}/buoy/${slug}`,
            description: `Real-time buoy data for ${buoy.name}`,
            mainEntity: {
              "@type": "Place",
              name: buoy.name,
              url: `https://labouee.app/${locale}/buoy/${slug}`,
              geo: {
                "@type": "GeoCoordinates",
                latitude: lat,
                longitude: lng,
              },
              additionalProperty: reading ? [
                reading.significient_height && {
                  "@type": "PropertyValue",
                  name: "waveHeight",
                  value: reading.significient_height,
                  unitCode: "MTR",
                },
                reading.maximum_height && {
                  "@type": "PropertyValue",
                  name: "maximumWaveHeight",
                  value: reading.maximum_height,
                  unitCode: "MTR",
                },
                reading.period && {
                  "@type": "PropertyValue",
                  name: "swellPeriod",
                  value: reading.period,
                  unitCode: "SEC",
                },
                reading.water_temperature && {
                  "@type": "PropertyValue",
                  name: "waterTemperature",
                  value: reading.water_temperature,
                  unitCode: "CEL",
                },
                reading.direction && {
                  "@type": "PropertyValue",
                  name: "swellDirection",
                  value: `${reading.direction}° ${directionLabel}`,
                },
              ].filter(Boolean) : [],
            },
          }),
        }}
      />
    </main>
  );
}
