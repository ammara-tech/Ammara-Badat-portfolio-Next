import { notes } from "@/content/notes";
import { siteName, siteUrl } from "@/lib/site";

/*
  RSS feed at /notes/rss.xml. RSS is a standard list of new posts that
  feed readers (Feedly, Inoreader, Outlook...) check, so people can follow
  my dev notes without visiting the site.
*/

export const dynamic = "force-static";

// Makes text safe to put inside XML
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function GET() {
  const items = notes
    .map((n) => {
      const url = `${siteUrl}/notes/${n.slug}`;
      return `    <item>
      <title>${esc(n.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(n.description)}</description>
      <pubDate>${new Date(`${n.date}T09:00:00+02:00`).toUTCString()}</pubDate>
${n.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dev notes — ${esc(siteName)}</title>
    <link>${siteUrl}/notes</link>
    <description>What I built and learned as a junior full stack developer.</description>
    <language>en-za</language>
    <atom:link href="${siteUrl}/notes/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
