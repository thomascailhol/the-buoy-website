import Link from 'next/link';
import { Navigation, History, Waves, MapPinned } from 'lucide-react';
import { 
  fetchBuoyReadings, 
  fetchNearestBuoys, 
  fetchNearestSpots, 
  slugify, 
  getDirectionLabel,
  type BuoyReading,
  type NearbyBuoy,
  type Spot
} from '@/lib/api/buoys';
import { type Locale } from '@/middleware';

type TranslationsType = {
  recentReadings: string;
  last24Hours: string;
  time: string;
  waveHeight: string;
  maxHeight: string;
  period: string;
  direction: string;
  waterTemp: string;
  noReadings: string;
  nearbyBuoys: string;
  nearbySpots: string;
  kmAway: string;
  noNearbyBuoys: string;
  noNearbySpots: string;
};

// Format time for display
function formatTime(dateString: string, locale: Locale) {
  const date = new Date(dateString);
  return date.toLocaleString(locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Async component for readings table
export async function ReadingsTable({ 
  buoyId, 
  locale,
  translations 
}: { 
  buoyId: number; 
  locale: Locale;
  translations: TranslationsType;
}) {
  const readings = await fetchBuoyReadings(buoyId, 24);
  const text = translations;

  return (
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
                    {formatTime(r.time, locale)}
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
  );
}

// Async component for nearby buoys
export async function NearbyBuoysSection({ 
  lat, 
  lng, 
  currentBuoyId,
  locale,
  translations 
}: { 
  lat: number; 
  lng: number; 
  currentBuoyId: number;
  locale: Locale;
  translations: TranslationsType;
}) {
  const nearestBuoys = await fetchNearestBuoys(lat, lng, 200);
  const otherNearbyBuoys = nearestBuoys.filter(b => b.id !== currentBuoyId).slice(0, 5);
  const text = translations;

  return (
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
  );
}

// Async component for nearby spots
export async function NearbySpotsSection({ 
  lat, 
  lng,
  translations 
}: { 
  lat: number; 
  lng: number;
  translations: TranslationsType;
}) {
  const nearestSpots = await fetchNearestSpots(lat, lng, 200);
  const nearbySpots = nearestSpots.slice(0, 5);
  const text = translations;

  return (
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
  );
}

