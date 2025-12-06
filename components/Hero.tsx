import Image from 'next/image';
import { getServerContent } from '@/lib/i18n/server-content';
import type { Locale } from '@/middleware';

/**
 * Server-rendered Hero component
 * All content is rendered in the specified locale for SEO
 */
export default function Hero({ locale }: { locale: Locale }) {
  const content = getServerContent(locale);
  const logoSrc = locale === 'en' ? '/assets/logo-horizontal-en.svg' : '/assets/la_bouee_fr.svg';
  return (
    <section className="min-h-screen flex items-center justify-center bg-primary text-primary-foreground px-4 py-20 overflow-x-hidden">
      <div className="container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <Image 
              src={logoSrc} 
              alt="La Bouée - Application de conditions de surf en temps réel" 
              width={200}
              height={64}
              className="h-12 md:h-16 mx-auto lg:mx-0 w-auto animate-on-load animate-fade-in-down"
              priority
            />
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight animate-on-load animate-fade-in-up animation-delay-100">
              {content.hero.title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl opacity-90 max-w-xl mx-auto lg:mx-0 animate-on-load animate-fade-in-up animation-delay-200">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-col items-center lg:items-start gap-4 w-full animate-on-load animate-fade-in-up animation-delay-300">
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
          <div className="relative w-full max-w-sm mx-auto animate-on-load animate-slide-in-right animation-delay-200">
            <Image 
              src="/assets/screenshot-1.png" 
              alt="Capture d'écran de l'application La Bouée montrant les bouées favorites et les conditions de surf" 
              width={400}
              height={800}
              className="w-full h-auto rounded-3xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
