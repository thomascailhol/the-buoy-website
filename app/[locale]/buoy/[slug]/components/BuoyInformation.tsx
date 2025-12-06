import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";
import { type Buoy } from "@/lib/api/buoys";

type BuoyInformationProps = {
  buoy: Buoy;
  locale: Locale;
  lat: number;
  lng: number;
};

export function BuoyInformation({
  buoy,
  locale,
  lat,
  lng,
}: BuoyInformationProps) {
  const content = getServerContent(locale);

  return (
    <div className="bg-muted/50 border rounded-xl p-6 mb-8 animate-on-load animate-fade-in-up animation-delay-200">
      <h2 className="text-xl font-bold mb-4">{content.buoy.aboutBuoy}</h2>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">{content.buoy.location}</h3>
          <p className="text-sm text-muted-foreground">
            {content.buoy.buoyTitle} {buoy.name} {content.buoy.locationDesc} (
            {lat.toFixed(6)}° lat, {lng.toFixed(6)}° lng)
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">{content.buoy.dataMeasured}</h3>
          <p className="text-sm text-muted-foreground">
            {content.buoy.dataDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
