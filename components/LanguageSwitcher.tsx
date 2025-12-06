'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/middleware';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (newLocale: Locale) => {
    // Don't do anything if already on this locale
    if (newLocale === currentLocale) return;
    
    // Update i18n
    i18n.changeLanguage(newLocale);
    
    // Set cookie for future visits
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
    
    // Preserve the current path when switching languages
    // Replace the locale in the pathname with the new locale
    // e.g., /fr/buoy/some-buoy -> /en/buoy/some-buoy
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    
    // Preserve query parameters if any
    const queryString = searchParams.toString();
    const finalUrl = queryString ? `${newPath}?${queryString}` : newPath;
    
    // Use window.location for full page navigation to ensure server-side rendering
    // This ensures the new locale is properly rendered on the server
    window.location.href = finalUrl;
  };

  const localeNames: Record<Locale, string> = {
    fr: '🇫🇷 Français',
    en: '🇬🇧 English',
    es: '🇪🇸 Español',
  };

  // Only render on client to avoid hydration mismatch with Radix UI IDs
  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-sm" disabled>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => changeLanguage(locale)}
            className={`cursor-pointer ${currentLocale === locale ? 'bg-accent' : ''}`}
          >
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

