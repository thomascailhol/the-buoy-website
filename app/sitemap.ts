import { MetadataRoute } from "next";
import { fetchAllBuoys, slugify } from "@/lib/api/buoys";
import { locales } from "@/middleware";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://labouee.app";

  // Static pages for each locale
  const staticPages = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
  ]);

  // Dynamic buoy pages for each locale
  let buoyPages: MetadataRoute.Sitemap = [];

  try {
    const buoys = await fetchAllBuoys();

    buoyPages = buoys.flatMap((buoy) => {
      const slug = slugify(buoy.name);

      return locales.map((locale) => ({
        url: `${baseUrl}/${locale}/buoy/${slug}`,
        lastModified: buoy.last_reading_time
          ? new Date(buoy.last_reading_time)
          : new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      }));
    });
  } catch (error) {
    console.error("Failed to fetch buoys for sitemap:", error);
  }

  return [...staticPages, ...buoyPages];
}

