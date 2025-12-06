import Link from "next/link";
import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";

type BuoyCTAProps = {
  locale: Locale;
};

export function BuoyCTA({ locale }: BuoyCTAProps) {
  const content = getServerContent(locale);

  return (
    <div className="bg-primary/5 rounded-xl p-8 text-center animate-on-load animate-fade-in-up animation-delay-400">
      <h2 className="text-2xl font-bold mb-4">{content.buoy.viewOtherBuoys}</h2>
      <p className="text-muted-foreground mb-6">
        {content.buoy.exploreOtherBuoys}
      </p>
      <Link
        href={`/${locale}#buoys-map`}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
      >
        {content.buoy.viewOtherBuoys}
      </Link>
    </div>
  );
}
