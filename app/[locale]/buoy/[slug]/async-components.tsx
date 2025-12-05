import { Suspense } from "react";
import Link from "next/link";
import { Navigation2, History, Waves, MapPinned } from "lucide-react";
import {
  fetchBuoyReadings,
  fetchNearestBuoys,
  fetchNearestSpots,
  slugify,
  getDirectionLabel,
  type BuoyReading,
  type NearbyBuoy,
  type Spot,
} from "@/lib/api/buoys";
import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";
import { PaginationControls } from "./components/PaginationControls";
import { PerPageSelector } from "./components/PerPageSelector";

// Format time for display in the buoy's timezone (defaults to UTC)
function formatTime(dateString: string, locale: Locale, timezone?: string) {
  const date = new Date(dateString);
  const localeString =
    locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US";

  return date.toLocaleString(localeString, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || "UTC",
  });
}

// Get timezone display name (e.g., "Europe/Paris" -> "CET" or "Europe/Paris")
function getTimezoneDisplay(timezone?: string): string {
  if (!timezone) return "UTC";

  try {
    // Try to get a short timezone name
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((part) => part.type === "timeZoneName")?.value;
    return tzName || timezone;
  } catch {
    return timezone;
  }
}

import { ReadingsTableRowsSkeleton } from "./skeletons";

// Wrapper component for readings table (renders static header + async content)
export function ReadingsTable({
  buoyId,
  locale,
  page = 1,
  perPage = 20,
  slug,
  timezone,
}: {
  buoyId: number;
  locale: Locale;
  page?: number;
  perPage?: number;
  slug: string;
  timezone?: string;
}) {
  const content = getServerContent(locale);
  const text = content.buoy;

  return (
    <div className="bg-card border rounded-xl p-6 mb-8 shadow-sm">
      {/* Static Header - always visible */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">{text.recentReadings}</h2>
            <p className="text-sm text-muted-foreground">{text.last24Hours}</p>
          </div>
        </div>
        <PerPageSelector
          currentPerPage={perPage}
          locale={locale}
          slug={slug}
          label={text.perPage}
        />
      </div>

      {/* Table with static header and async body */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-semibold text-muted-foreground">
                <div className="flex flex-col gap-0.5">
                  <span>{text.time}</span>
                  <span className="text-xs font-normal opacity-75">
                    ({getTimezoneDisplay(timezone)})
                  </span>
                </div>
              </th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground">
                {text.waveHeight}
              </th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground">
                {text.maxHeight}
              </th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground">
                {text.period}
              </th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground">
                {text.direction}
              </th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground">
                {text.waterTemp}
              </th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground">
                {text.energy}
              </th>
            </tr>
          </thead>
          <Suspense
            key={`tbody-${page}-${perPage}`}
            fallback={<ReadingsTableRowsSkeleton rowCount={perPage} />}
          >
            <ReadingsTableBody
              buoyId={buoyId}
              locale={locale}
              page={page}
              perPage={perPage}
              slug={slug}
              timezone={timezone}
            />
          </Suspense>
        </table>
      </div>
    </div>
  );
}

// Async component that fetches and renders table rows + pagination
async function ReadingsTableBody({
  buoyId,
  locale,
  page,
  perPage,
  slug,
  timezone,
}: {
  buoyId: number;
  locale: Locale;
  page: number;
  perPage: number;
  slug: string;
  timezone?: string;
}) {
  const result = await fetchBuoyReadings(buoyId, 24, page, perPage);
  const { readings, pagination } = result;
  const content = getServerContent(locale);
  const text = content.buoy;

  // Only show highlight on first page
  const isFirstPage = page === 1;

  if (readings.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={7} className="text-center py-8 text-muted-foreground">
            {text.noReadings}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <>
      <tbody>
        {readings.map((r, index) => (
          <tr
            key={r.id}
            className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${isFirstPage && index === 0 ? "bg-primary/5" : ""}`}
          >
            <td className="py-3 px-2 font-medium whitespace-nowrap">
              {formatTime(r.time, locale, timezone)}
            </td>
            <td className="p-0 align-middle">
              {r.significient_height != null ? (
                <div className="bg-blue-500 text-white px-2 md:px-4 py-1 md:py-3 text-center">
                  <div className="font-bold text-sm md:text-base whitespace-nowrap">
                    {r.significient_height.toFixed(1)}m
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 px-2">-</div>
              )}
            </td>
            <td className="text-center py-3 px-2">
              {r.maximum_height != null ? (
                <span className="text-destructive">
                  {r.maximum_height.toFixed(1)}m
                </span>
              ) : (
                "-"
              )}
            </td>
            <td className="text-center py-3 px-2">
              {r.period != null ? `${r.period.toFixed(1)}s` : "-"}
            </td>
            <td className="text-center py-3 px-2">
              {r.direction != null ? (
                <span className="inline-flex items-center gap-1">
                  <Navigation2
                    className="h-3 w-3 text-muted-foreground"
                    style={{
                      transform: `rotate(${r.direction + 180}deg)`,
                      transformOrigin: "center",
                      display: "inline-block",
                    }}
                  />
                  {r.direction}° {getDirectionLabel(r.direction)}
                </span>
              ) : (
                "-"
              )}
            </td>
            <td className="text-center py-3 px-2">
              {r.water_temperature != null ? (
                <span className="text-blue-500">
                  {r.water_temperature.toFixed(1)}°C
                </span>
              ) : (
                "-"
              )}
            </td>
            <td className="text-center py-3 px-2">
              {r.energy_per_wave != null || r.energy != null ? (
                <span className="font-medium">
                  {Math.round(r.energy_per_wave ?? r.energy ?? 0)}{" "}
                  {content.buoy.energyUnit || "kJ"}
                </span>
              ) : (
                "-"
              )}
            </td>
          </tr>
        ))}
      </tbody>
      {pagination.totalPages > 1 && (
        <tfoot>
          <tr>
            <td colSpan={7} className="pt-6">
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                locale={locale}
                slug={slug}
                perPage={perPage}
                previousLabel={text.previousPage}
                nextLabel={text.nextPage}
                pageLabel={text.page}
              />
            </td>
          </tr>
        </tfoot>
      )}
    </>
  );
}

// Async component for nearby buoys
export async function NearbyBuoysSection({
  lat,
  lng,
  currentBuoyId,
  locale,
}: {
  lat: number;
  lng: number;
  currentBuoyId: number;
  locale: Locale;
}) {
  const nearestBuoys = await fetchNearestBuoys(lat, lng, 200);
  const otherNearbyBuoys = nearestBuoys
    .filter((b) => b.id !== currentBuoyId)
    .slice(0, 5);
  const content = getServerContent(locale);
  const text = content.buoy;

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
  locale,
}: {
  lat: number;
  lng: number;
  locale: Locale;
}) {
  const nearestSpots = await fetchNearestSpots(lat, lng, 200);
  const nearbySpots = nearestSpots.slice(0, 5);
  const content = getServerContent(locale);
  const text = content.buoy;

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
                <p className="font-medium text-sm truncate">{spot.name}</p>
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
