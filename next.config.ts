import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  // Security headers on every page and file (lib/security-headers.ts explains each one)
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    // Serve screenshots as WebP, which is much smaller than PNG and quick for Vercel to create
    // (AVIF is a little smaller but much slower to create the first time, which made phones wait)
    formats: ["image/webp"],
    // Keep resized images cached for 31 days, so they are created once and then served instantly
    minimumCacheTTL: 2678400,
    // Allow resizing images uploaded to my Supabase Storage bucket from /admin
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
