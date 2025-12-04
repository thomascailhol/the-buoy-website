import Image from 'next/image';
import { getServerContent } from '@/lib/i18n/server-content';
import type { Locale } from '@/middleware';

export default function Footer({ locale }: { locale: Locale }) {
  const content = getServerContent(locale);
  
  return (
    <footer className="py-12 px-4 bg-background border-t border-border">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/assets/app-icon.png" 
              alt="Logo La Bouée"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl"
            />
            <div>
              <p className="font-semibold text-foreground">La Bouée</p>
              <p className="text-sm text-muted-foreground">
                {content.footer.tagline}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-sm text-muted-foreground">
              {content.footer.developer}
            </p>
            <p className="text-sm text-muted-foreground">
              {content.footer.languages}
            </p>
            <p className="text-xs text-muted-foreground">
              {content.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
