import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";
import { type Buoy, getDirectionLabel } from "@/lib/api/buoys";

type GenerateStructuredDataParams = {
  buoy: Buoy;
  locale: Locale;
  slug: string;
  lat: number;
  lng: number;
};

export function generateStructuredData({
  buoy,
  locale,
  slug,
  lat,
  lng,
}: GenerateStructuredDataParams): string {
  const content = getServerContent(locale);
  const reading = buoy.last_reading;
  const directionLabel = reading?.direction
    ? getDirectionLabel(reading.direction)
    : null;

  const realTimeLabel =
    locale === "fr"
      ? "Données en temps réel"
      : locale === "es"
        ? "Datos en tiempo real"
        : "Real-time data";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${content.buoy.buoyTitle} ${buoy.name} - ${realTimeLabel}`,
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
      additionalProperty: reading
        ? [
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
          ].filter(Boolean)
        : [],
    },
  };

  return JSON.stringify(structuredData);
}
