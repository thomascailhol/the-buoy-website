'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook that ensures translations only render after client-side hydration
 * This prevents hydration mismatches between server and client
 */
export function useClientTranslation() {
  const [mounted, setMounted] = useState(false);
  const translation = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    ...translation,
    mounted,
  };
}

