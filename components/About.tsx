import { getServerContent } from '@/lib/i18n/server-content';
import type { Locale } from '@/middleware';

export default function About({ locale }: { locale: Locale }) {
  const content = getServerContent(locale);
  
  return (
    <section className="py-20 px-4 bg-accent/5 overflow-x-hidden">
      <div className="container max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-8 animate-on-load animate-fade-in-up">
          {content.about.title}
        </h2>
        <div className="space-y-6 text-base md:text-lg text-muted-foreground animate-on-load animate-fade-in-up animation-delay-100">
          <p>
            {content.about.paragraph1}
          </p>
          <p>
            {content.about.paragraph2}
          </p>
          <p>
            {content.about.paragraph3}
          </p>
        </div>
      </div>
    </section>
  );
}
