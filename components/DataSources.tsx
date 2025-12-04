import { getServerContent } from '@/lib/i18n/server-content';
import type { Locale } from '@/middleware';

export default function DataSources({ locale }: { locale: Locale }) {
  const content = getServerContent(locale);
  
  const dataSourceItems = [
    content.dataSources.candhis,
    content.dataSources.puertos,
    content.dataSources.pml,
    content.dataSources.infraestruturas,
    content.dataSources.marine,
    content.dataSources.meteofrance,
    content.dataSources.noaa,
  ];
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-accent/10 overflow-x-hidden">
      <div className="container max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {content.dataSources.title}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.dataSources.description}
          </p>
        </header>
        
        <div className="space-y-6">
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm">
            <ul className="space-y-4 text-sm md:text-base text-muted-foreground">
              {dataSourceItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-primary text-lg">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
