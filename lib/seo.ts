import type { Metadata } from "next";
import { siteName, siteUrl } from "@/lib/site";

/*
  Milestone 5: every page gets the same set of search and sharing tags.
  - title and description: what Google shows in the results
  - canonical: the one official address of the page, so Google doesn't
    count /projects and /projects?tag=CSS as different pages
  - Open Graph and Twitter: the title, text and picture shown when the link is
    shared on WhatsApp, LinkedIn, Teams or X. The picture comes from the
    opengraph-image file in the same folder as the page.
*/
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
      // keeps the dev notes RSS feed discoverable from every page
      types: { "application/rss+xml": [{ url: "/notes/rss.xml", title: "Dev notes by Ammara Badat" }] },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      locale: "en_ZA",
      type,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/*
  Structured data helpers (JSON-LD, https://schema.org).
  Breadcrumbs let Google show "Home › Projects › MyFlix" under a result.
*/

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/** The person every page is about, defined once in app/layout.tsx */
export const personRef = { "@id": `${siteUrl}/#person` };
