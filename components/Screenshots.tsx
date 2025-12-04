import Image from "next/image";
import { getServerContent } from "@/lib/i18n/server-content";
import type { Locale } from "@/middleware";

export default function Screenshots({ locale }: { locale: Locale }) {
  const content = getServerContent(locale);

  const screenshots = [
    {
      src: "/assets/screenshot-2.png",
      alt: content.screenshots.buoyDetails,
    },
    {
      src: "/assets/screenshot-3.png",
      alt: content.screenshots.map,
    },
    {
      src: "/assets/screenshot-4.png",
      alt: content.screenshots.forecast,
    },
  ];
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-accent/20 to-background overflow-x-hidden">
      <div className="container max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {content.screenshots.title}
          </h2>
        </header>
        <div className="grid md:grid-cols-3 gap-8">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="relative w-full">
              <Image
                src={screenshot.src}
                alt={screenshot.alt}
                width={400}
                height={800}
                className="w-full h-auto rounded-3xl shadow-xl hover:scale-105 transition-transform duration-300 max-w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
