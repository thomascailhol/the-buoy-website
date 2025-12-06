import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip compression for faster response times
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Turbopack configuration (Next.js 16+)
  // Mapbox GL JS works with Turbopack without special config
  turbopack: {},

  // Optimize for production
  poweredByHeader: false, // Remove X-Powered-By header (security + smaller response)
};

export default nextConfig;
