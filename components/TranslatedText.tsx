'use client';

import { ReactNode } from 'react';

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
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}) {
  const ComponentTag = Component as any;
  return (
    <ComponentTag className={className} suppressHydrationWarning {...props}>
      {children}
    </ComponentTag>
  );
}

