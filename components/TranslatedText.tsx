'use client';

import React, { ReactNode } from 'react';

/**
 * Wrapper component for translated text that suppresses hydration warnings
 * This prevents hydration mismatches when i18n detects a different language on the client
 */
export function TranslatedText({ 
  children, 
  as: Component = 'span',
  className,
  ...props 
}: { 
  children: ReactNode;
  as?: React.ElementType;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <Component className={className} suppressHydrationWarning {...props}>
      {children}
    </Component>
  );
}

