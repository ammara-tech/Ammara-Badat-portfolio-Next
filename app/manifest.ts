import type { MetadataRoute } from "next";
import { about } from "@/content/about";

/*
  Web app manifest, served at /manifest.webmanifest.
  It lets visitors install the portfolio on their phone or computer
  ("Add to Home screen"), with my icon and colours.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${about.name} — ${about.role}`,
    short_name: "Ammara Badat",
    description: "Portfolio of Ammara Badat, a junior full stack developer building with Next.js, React and Supabase.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#15151e",
    theme_color: "#15151e",
    lang: "en-ZA",
    categories: ["portfolio", "developer", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Projects", url: "/projects" },
      { name: "Case study", url: "/projects/nextjs-dashboard" },
      { name: "Contact", url: "/contact" },
    ],
  };
}
