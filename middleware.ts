import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const locales = ['fr', 'en', 'es'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'fr';

/**
 * Get locale from request headers or cookie
 */
function getLocale(request: NextRequest): Locale | null {
  // Check cookie first (user preference)
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    // Parse Accept-Language header (e.g., "en-US,en;q=0.9,fr;q=0.8")
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().toLowerCase());
    
    // Check for exact match first
    for (const lang of languages) {
      if (locales.includes(lang as Locale)) {
        return lang as Locale;
      }
    }
    
    // Check for language prefix (e.g., "en-US" -> "en")
    for (const lang of languages) {
      const prefix = lang.split('-')[0];
      if (locales.includes(prefix as Locale)) {
        return prefix as Locale;
      }
    }
  }

  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If already has locale, ensure cookie is set and continue
  if (pathnameHasLocale) {
    const localeFromPath = pathname.split('/')[1] as Locale;
    if (locales.includes(localeFromPath)) {
      const response = NextResponse.next();
      // Update cookie to match current path locale
      response.cookies.set('locale', localeFromPath, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      });
      return response;
    }
    return NextResponse.next();
  }

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Detect locale
  const locale = getLocale(request) || defaultLocale;
  
  // Set cookie with detected locale for future requests
  const response = NextResponse.redirect(
    new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
  );
  response.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};

