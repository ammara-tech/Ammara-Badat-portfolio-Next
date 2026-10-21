import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/*
  robots.txt, served at /robots.txt.
  Search engines may read every page except the admin area and the API,
  and are pointed to the sitemap.
*/

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
