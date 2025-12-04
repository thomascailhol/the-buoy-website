'use client';

import { useEffect } from 'react';
import type { Locale } from '@/middleware';

/**
 * Client component to set html lang attribute dynamically
 * Since nested layouts can't modify the root html tag, we do it client-side
 */
export default function LocaleScript({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}

