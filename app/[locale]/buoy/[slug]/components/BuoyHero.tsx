import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";
import { type Buoy } from "@/lib/api/buoys";

type BuoyHeroProps = {
  buoy: Buoy;
  locale: Locale;
};

export function BuoyHero({ buoy, locale }: BuoyHeroProps) {
  const content = getServerContent(locale);

  return (
    <header className="bg-gradient-to-b from-primary/5 to-background py-4 md:py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-2 md:mb-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 md:mb-2">
            {content.buoy.buoyTitle} {buoy.name}
          </h1>
        </div>
        {buoy.source && (
          <div className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">
            {content.buoy.source}:{" "}
            <span className="font-medium">{buoy.source}</span>
          </div>
        )}
      </div>
    </header>
  );
}
