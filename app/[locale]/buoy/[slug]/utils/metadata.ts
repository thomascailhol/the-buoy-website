import { type Metadata } from "next";
import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";
import { type Buoy } from "@/lib/api/buoys";

type GenerateMetadataParams = {
  buoy: Buoy | null;
  locale: Locale;
  slug: string;
};

export async function generateBuoyMetadata({
  buoy,
  locale,
  slug,
}: GenerateMetadataParams): Promise<Metadata> {
  if (!buoy) {
    return {
      title: "Buoy Not Found",
    };
  }

  const content = getServerContent(locale);
  const reading = buoy.last_reading;

  const title = `${content.buoy.buoyTitle} ${buoy.name} - ${
    locale === "fr"
      ? "Données Météo Marine"
      : locale === "es"
        ? "Datos Meteorológicos Marinos"
        : "Marine Weather Data"
  } | ${locale === "fr" ? "La Bouée" : locale === "es" ? "La Boya" : "The Buoy"}`;

  const description =
    locale === "fr"
      ? `Consultez les données en temps réel de la bouée ${buoy.name} : hauteur des vagues ${reading?.significient_height?.toFixed(1) || "N/A"}m, période ${reading?.period?.toFixed(1) || "N/A"}s${reading?.water_temperature ? `, température de l'eau ${reading.water_temperature.toFixed(1)}°C` : ""}.`
      : locale === "es"
        ? `Consulte los datos en tiempo real de la boya ${buoy.name}: altura de olas ${reading?.significient_height?.toFixed(1) || "N/A"}m, período ${reading?.period?.toFixed(1) || "N/A"}s${reading?.water_temperature ? `, temperatura del agua ${reading.water_temperature.toFixed(1)}°C` : ""}.`
        : `View real-time data from ${buoy.name} buoy: wave height ${reading?.significient_height?.toFixed(1) || "N/A"}m, period ${reading?.period?.toFixed(1) || "N/A"}s${reading?.water_temperature ? `, water temperature ${reading.water_temperature.toFixed(1)}°C` : ""}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://labouee.app/${locale}/buoy/${slug}`,
      languages: {
        fr: `https://labouee.app/fr/buoy/${slug}`,
        en: `https://labouee.app/en/buoy/${slug}`,
        es: `https://labouee.app/es/buoy/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `https://labouee.app/${locale}/buoy/${slug}`,
      type: "website",
    },
  };
}
