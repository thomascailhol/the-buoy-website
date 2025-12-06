import Image from 'next/image';
import { getServerContent } from '@/lib/i18n/server-content';
import type { Locale } from '@/middleware';

export default function CTA({ locale }: { locale: Locale }) {
  const content = getServerContent(locale);
  
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground overflow-x-hidden">
      <div className="container max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 animate-on-load animate-fade-in-up">
          {content.cta.title}
        </h2>
        <p className="text-base md:text-lg mb-8 opacity-90 animate-on-load animate-fade-in-up animation-delay-100">
          {content.cta.subtitle}
        </p>
        <div className="flex flex-col items-center gap-4 w-full animate-on-load animate-fade-in-up animation-delay-200">
          <a 
            href="https://apps.apple.com/fr/app/la-bou%C3%A9e/id6476977153"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={content.cta.downloadIOS}
            className="transition-transform hover:scale-105"
          >
            <Image 
              src="/assets/la_bouee_ios.svg" 
              alt={content.cta.downloadIOS} 
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </a>
          <a 
            href="https://play.google.com/store/apps/details?id=com.txitxu.la_bouee"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={content.cta.downloadAndroid}
            className="transition-transform hover:scale-105"
          >
            <Image 
              src="/assets/la_bouee_android.svg" 
              alt={content.cta.downloadAndroid} 
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
