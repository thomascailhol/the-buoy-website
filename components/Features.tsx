import { getServerContent } from '@/lib/i18n/server-content';
import { Clock, TrendingUp, Map } from "lucide-react";
import type { Locale } from '@/middleware';

/**
 * Server-rendered Features component
 */
export default function Features({ locale }: { locale: Locale }) {
  const content = getServerContent(locale);
  
  const features = [
    {
      icon: Clock,
      title: content.features.realtime.title,
      description: content.features.realtime.description,
    },
    {
      icon: TrendingUp,
      title: content.features.forecast.title,
      description: content.features.forecast.description,
    },
    {
      icon: Map,
      title: content.features.coverage.title,
      description: content.features.coverage.description,
    },
  ];
  const animationDelays = ["", "animation-delay-100", "animation-delay-200"];

  return (
    <section className="py-20 px-4 bg-accent overflow-x-hidden">
      <div className="container max-w-6xl mx-auto">
        <header className="text-center mb-16 animate-on-load animate-fade-in-up">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {content.features.title}
          </h2>
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={index}
                className={`bg-card p-6 rounded-2xl hover:shadow-lg transition-all hover:scale-105 animate-on-load animate-fade-in-up ${animationDelays[index] || ""}`}
              >
                <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
