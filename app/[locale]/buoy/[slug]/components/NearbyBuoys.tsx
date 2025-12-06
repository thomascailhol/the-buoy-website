import Link from "next/link";
import { Navigation2 } from "lucide-react";
import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";
import {
  fetchNearestBuoys,
  slugify,
  getDirectionLabel,
  type NearbyBuoy,
} from "@/lib/api/buoys";

type NearbyBuoysProps = {
  lat: number;
  lng: number;
  locale: Locale;
  currentBuoyId: number;
  maxDistance?: number;
  limit?: number;
};

export async function NearbyBuoys({
  lat,
  lng,
  locale,
  currentBuoyId,
  maxDistance = 200,
  limit = 5,
}: NearbyBuoysProps) {
  const content = getServerContent(locale);
  const nearbyBuoys = await fetchNearestBuoys(lat, lng, maxDistance, limit);

  // Filter out the current buoy from the list
  const otherBuoys = nearbyBuoys.filter((buoy) => buoy.id !== currentBuoyId);

  if (otherBuoys.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6 mb-8 animate-on-load animate-fade-in-up animation-delay-300">
        <h2 className="text-xl font-bold mb-4">{content.buoy.nearbyBuoys}</h2>
        <p className="text-sm text-muted-foreground">
          {content.buoy.noNearbyBuoys}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 mb-8 animate-on-load animate-fade-in-up animation-delay-300">
      <h2 className="text-xl font-bold mb-4">{content.buoy.nearbyBuoys}</h2>
      <div className="space-y-3">
        {otherBuoys.map((buoy) => {
          const slug = slugify(buoy.name);
          const reading = buoy.last_reading;

          return (
            <Link
              key={buoy.id}
              href={`/${locale}/buoy/${slug}`}
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {buoy.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {buoy.distance_km.toFixed(1)} {content.buoy.kmAway}
                    </span>
                    {reading?.significient_height != null && (
                      <span className="font-medium text-foreground">
                        {reading.significient_height.toFixed(1)}m
                      </span>
                    )}
                    {reading?.period != null && (
                      <span>{reading.period.toFixed(1)}s</span>
                    )}
                    {reading?.direction != null && (
                      <span className="inline-flex items-center gap-1">
                        <Navigation2
                          className="h-3 w-3"
                          style={{
                            transform: `rotate(${reading.direction + 180}deg)`,
                            transformOrigin: "center",
                            display: "inline-block",
                          }}
                        />
                        {reading.direction}°{" "}
                        {getDirectionLabel(reading.direction)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-primary text-sm font-medium">
                  {content.buoy.viewBuoy} →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
