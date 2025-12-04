import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Turbopack configuration (Next.js 16+)
  // Mapbox GL JS works with Turbopack without special config
  turbopack: {},
};

export default nextConfig;
