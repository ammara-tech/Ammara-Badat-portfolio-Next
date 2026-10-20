import type { MetadataRoute } from "next";

/*
  robots.txt, served at /robots.txt.
  Search engines may read every page except the admin area and the API,
  and are pointed to the sitemap.
*/

const siteUrl = "https://ammara-badat-portfolio-next.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
