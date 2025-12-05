import { MapPin, Calendar } from "lucide-react";
import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";
import { type Buoy } from "@/lib/api/buoys";

type BuoyHeroProps = {
  buoy: Buoy;
  locale: Locale;
  lat: number;
  lng: number;
  lastUpdate: Date | null;
};

export function BuoyHero({
  buoy,
  locale,
  lat,
  lng,
  lastUpdate,
}: BuoyHeroProps) {
  const content = getServerContent(locale);

  const localeString =
    locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  return (
    <header className="bg-gradient-to-b from-primary/5 to-background py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            {content.buoy.buoyTitle} {buoy.name}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <p className="text-lg">
              {lat.toFixed(4)}° N, {lng.toFixed(4)}° {lng >= 0 ? "E" : "W"}
            </p>
          </div>
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p>
              {content.buoy.lastUpdate}:{" "}
              {lastUpdate.toLocaleString(localeString, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>
        )}
        {buoy.source && (
          <div className="mt-2 text-sm text-muted-foreground">
            {content.buoy.source}:{" "}
            <span className="font-medium">{buoy.source}</span>
          </div>
        )}
      </div>
    </header>
  );
}
