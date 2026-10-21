import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve screenshots as AVIF or WebP, which are much smaller than PNG
    formats: ["image/avif", "image/webp"],
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
