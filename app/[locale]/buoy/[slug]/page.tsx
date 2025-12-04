import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchAllBuoys, fetchBuoyBySlug, fetchBuoyReadings, fetchNearestBuoys, fetchNearestSpots, slugify, getDirectionLabel, type Buoy, type BuoyReading, type NearbyBuoy, type Spot } from '@/lib/api/buoys';
import type { Locale } from '@/middleware';
import { getServerContent } from '@/lib/i18n/server-content';
import { ArrowLeft, MapPin, Navigation, Calendar, History, Waves, MapPinned } from 'lucide-react';

type Props = {
  params: Promise<{ locale: Locale; slug: string }> | { locale: Locale; slug: string };
};

// Generate static params for all buoys
export async function generateStaticParams() {
  try {
    const buoys = await fetchAllBuoys();
    const locales = ['fr', 'en', 'es'];
    
    return locales.flatMap((locale) =>
      buoys.map((buoy) => ({
        locale,
        slug: slugify(buoy.name),
      }))
    );
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale, slug } = resolvedParams;
  
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
  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale, slug } = resolvedParams;
  
  const buoy = await fetchBuoyBySlug(slug);
  
  if (!buoy) {
    notFound();
  }

  // Fetch last 24 hours of readings
  const readings = await fetchBuoyReadings(buoy.id, 24);
  
  // Ensure lat/lng are numbers for API calls
  const buoyLat = typeof buoy.lat === 'string' ? parseFloat(buoy.lat) : buoy.lat;
  const buoyLng = typeof buoy.lng === 'string' ? parseFloat(buoy.lng) : buoy.lng;
  
  // Fetch nearest buoys and spots
  const [nearestBuoys, nearestSpots] = await Promise.all([
    fetchNearestBuoys(buoyLat, buoyLng, 200),
    fetchNearestSpots(buoyLat, buoyLng, 200),
  ]);
  
  // Filter out the current buoy from nearest buoys
  const otherNearbyBuoys = nearestBuoys.filter(b => b.id !== buoy.id).slice(0, 5);
  const nearbySpots = nearestSpots.slice(0, 5);

  const content = getServerContent(locale);
  const reading = buoy.last_reading;
  const lastUpdate = reading?.time ? new Date(reading.time) : null;
  const directionLabel = reading?.direction ? getDirectionLabel(reading.direction) : null;
  
  // Ensure lat/lng are numbers
  const lat = typeof buoy.lat === 'string' ? parseFloat(buoy.lat) : buoy.lat;
  const lng = typeof buoy.lng === 'string' ? parseFloat(buoy.lng) : buoy.lng;

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

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        {/* Readings History Table */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="bg-card border rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-bold">{text.recentReadings}</h2>
                <p className="text-sm text-muted-foreground">{text.last24Hours}</p>
              </div>
            </div>
            
            {readings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-semibold text-muted-foreground">{text.time}</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">{text.waveHeight}</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">{text.maxHeight}</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">{text.period}</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">{text.direction}</th>
                      <th className="text-center py-3 px-2 font-semibold text-muted-foreground">{text.waterTemp}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r, index) => (
                      <tr 
                        key={r.id} 
                        className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${index === 0 ? 'bg-primary/5' : ''}`}
                      >
                        <td className="py-3 px-2 font-medium whitespace-nowrap">
                          {formatTime(r.time)}
                          {index === 0 && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              Latest
                            </span>
                          )}
                        </td>
                        <td className="text-center py-3 px-2">
                          {r.significient_height != null ? (
                            <span className="font-semibold text-primary">{r.significient_height.toFixed(1)}m</span>
                          ) : '-'}
                        </td>
                        <td className="text-center py-3 px-2">
                          {r.maximum_height != null ? (
                            <span className="text-destructive">{r.maximum_height.toFixed(1)}m</span>
                          ) : '-'}
                        </td>
                        <td className="text-center py-3 px-2">
                          {r.period != null ? `${r.period.toFixed(1)}s` : '-'}
                        </td>
                        <td className="text-center py-3 px-2">
                          {r.direction != null ? (
                            <span className="inline-flex items-center gap-1">
                              <Navigation 
                                className="h-3 w-3 text-muted-foreground" 
                                style={{ transform: `rotate(${r.direction + 180}deg)` }}
                              />
                              {r.direction}° {getDirectionLabel(r.direction)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="text-center py-3 px-2">
                          {r.water_temperature != null ? (
                            <span className="text-blue-500">{r.water_temperature.toFixed(1)}°C</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {text.noReadings}
              </div>
            )}
          </div>
        </div>

        {/* Nearby Buoys & Spots */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Nearby Buoys */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Waves className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">{text.nearbyBuoys}</h2>
              </div>
              {otherNearbyBuoys.length > 0 ? (
                <div className="space-y-3">
                  {otherNearbyBuoys.map((nearbyBuoy) => (
                    <Link
                      key={nearbyBuoy.id}
                      href={`/${locale}/buoy/${slugify(nearbyBuoy.name)}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {nearbyBuoy.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {nearbyBuoy.source}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        {nearbyBuoy.last_reading?.significient_height != null && (
                          <span className="text-sm font-semibold text-primary">
                            {nearbyBuoy.last_reading.significient_height.toFixed(1)}m
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
                          {nearbyBuoy.distance_km.toFixed(0)} {text.kmAway}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {text.noNearbyBuoys}
                </p>
              )}
            </div>

            {/* Nearby Spots */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MapPinned className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">{text.nearbySpots}</h2>
              </div>
              {nearbySpots.length > 0 ? (
                <div className="space-y-3">
                  {nearbySpots.map((spot) => (
                    <div
                      key={spot.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {spot.name}
                        </p>
                        {spot.country && (
                          <p className="text-xs text-muted-foreground">
                            {spot.country}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full flex-shrink-0 ml-3">
                        {spot.distance_km.toFixed(0)} {text.kmAway}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {text.noNearbySpots}
                </p>
              )}
            </div>
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

