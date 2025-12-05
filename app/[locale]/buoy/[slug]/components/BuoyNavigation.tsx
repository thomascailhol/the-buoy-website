import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type Locale } from "@/middleware";
import { getServerContent } from "@/lib/i18n/server-content";

type BuoyNavigationProps = {
  locale: Locale;
};

export function BuoyNavigation({ locale }: BuoyNavigationProps) {
  const content = getServerContent(locale);

  return (
    <nav className="border-b bg-card sticky top-0 z-10">
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {content.buoy.backToHome}
        </Link>
      </div>
    </nav>
  );
}
