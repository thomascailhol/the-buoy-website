import type { Locale } from "@/middleware";

/**
 * Sets html lang attribute immediately (before React hydration)
 * This ensures the lang attribute is correct for SEO and accessibility
 * Since nested layouts can't modify the root html tag, we use a blocking script
 */
export default function LocaleScript({ locale }: { locale: Locale }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang = ${JSON.stringify(locale)};`,
      }}
    />
  );
}
