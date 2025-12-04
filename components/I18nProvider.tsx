'use client';

import { useEffect } from 'react';
import '@/lib/i18n/config';
import i18n from '@/lib/i18n/config';
import type { Locale } from '@/middleware';

/**
 * I18nProvider - Only needed for LanguageSwitcher component
 * Since all content is server-rendered, we just need to sync i18n state
 * for the language switcher dropdown
 */
export function I18nProvider({ 
  children, 
  locale 
}: { 
  children: React.ReactNode;
  locale: Locale;
}) {
  useEffect(() => {
    // Sync i18n with URL locale (only needed for LanguageSwitcher)
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    // Update localStorage to remember preference
    localStorage.setItem('i18nextLng', locale);
  }, [locale]);

  return <>{children}</>;
}

