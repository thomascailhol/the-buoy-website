import "./globals.css";
import { cookies } from "next/headers";
import { defaultLocale, locales, type Locale } from "@/middleware";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Root layout - provides html/body structure
 * Locale-specific metadata is handled in [locale]/layout.tsx
 * The lang attribute is read from cookies (set by middleware based on browser language)
 * and will be updated by LocaleScript component for the correct locale
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie (set by middleware based on browser language)
  let lang: Locale = defaultLocale;

  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("locale")?.value;
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      lang = cookieLocale as Locale;
    }
  } catch (error) {
    // If cookies() fails, fall back to default locale
    // This can happen in some edge cases or during build
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
