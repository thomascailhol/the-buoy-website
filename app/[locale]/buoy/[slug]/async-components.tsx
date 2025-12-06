import { Suspense } from "react";
import { Navigation2 } from "lucide-react";
import {
  fetchBuoyReadings,
  getDirectionLabel,
  type BuoyReading,
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

// Get background color for wave height cell based on significant wave height
function getWaveHeightBackgroundColor(height?: number | null): string {
  if (height === null || height === undefined) return "#9fb9bf";

  if (height >= 12) return "#9a7f9b";
  if (height >= 10) return "#bfbfbf";
  if (height >= 7) return "#bf6757";
  if (height >= 5) return "#bf335f";
  if (height >= 4) return "#853030";
  if (height >= 3) return "#9a3097";
  if (height >= 2.5) return "#bb5abf";
  if (height >= 2) return "#393c8e";
  if (height >= 1.5) return "#3868bf";
  if (height >= 1) return "#30628d";
  if (height >= 0.5) return "#309db9";

  return "#9fb9bf";
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
    <div className="bg-card border rounded-xl mb-8 shadow-sm pb-6 animate-on-load animate-fade-in-up animation-delay-100">
      {/* Static Header - always visible */}
      <div className="flex items-center justify-between mb-6 px-6 pt-6">
        <div>
          <h2 className="text-xl font-bold">{text.recentReadings}</h2>
          <p className="text-sm text-muted-foreground">{text.last24Hours}</p>
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
            <td
              className="p-0 align-middle"
              style={
                r.significient_height != null
                  ? {
                      backgroundColor: getWaveHeightBackgroundColor(
                        r.significient_height
                      ),
                    }
                  : undefined
              }
            >
              {r.significient_height != null ? (
                <div
                  className="text-white px-2 md:px-4 py-1 md:py-3 w-full h-full text-center flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: getWaveHeightBackgroundColor(
                      r.significient_height
                    ),
                  }}
                >
                  <div className="font-bold text-sm md:text-base whitespace-nowrap">
                    {r.significient_height.toFixed(1)}m
                  </div>
                  {(r.energy_per_wave != null || r.energy != null) && (
                    <div className="text-xs opacity-90 whitespace-nowrap mt-0.5">
                      {Math.round(r.energy_per_wave ?? r.energy ?? 0)}{" "}
                      {content.buoy.energyUnit || "kJ"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 px-2">-</div>
              )}
            </td>
            <td className="text-center py-3 px-2">
              {r.maximum_height != null ? (
                <span className="text-foreground">
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
            <td colSpan={7} className="pt-6 px-6 pb-6">
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

