import type { Metadata } from "next";
import { formatDate, formatShortDate, notes, readingMinutes } from "@/content/notes";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Icon from "@/components/Icon";
import { Accent, Eyebrow, PageTitle } from "@/components/ui";
import NotesList, { type NoteSummary } from "@/components/NotesList";

export const metadata: Metadata = pageMetadata({
  title: "Dev notes — Ammara Badat",
  description:
    "Short posts by Ammara Badat about what she built and learned: web performance, Supabase security, Next.js and more.",
  path: "/notes",
});

// Only what the list shows goes to the browser, not every note's full text
const summaries: NoteSummary[] = notes.map((n) => ({
  slug: n.slug,
  title: n.title,
  description: n.description,
  date: n.date,
  dateLabel: formatDate(n.date),
  updated: n.updated,
  updatedLabel: n.updated ? formatShortDate(n.updated) : undefined,
  minutes: readingMinutes(n),
  tags: n.tags,
}));

export default function Notes() {
  return (
    <section>
      <JsonLd
        data={[
          breadcrumbs([{ name: "Dev notes", path: "/notes" }]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Dev notes by Ammara Badat",
            url: `${siteUrl}/notes`,
            author: personRef,
            blogPost: notes.map((n) => ({ "@type": "BlogPosting", headline: n.title, url: `${siteUrl}/notes/${n.slug}`, datePublished: n.date })),
          },
        ]}
      />
      <Eyebrow>Dev notes</Eyebrow>
      <PageTitle>
        Things I&apos;ve <Accent>learned</Accent>
      </PageTitle>
      <p className="fx-rise mt-5 max-w-2xl text-lg text-mist" style={{ animationDelay: "180ms" }}>
        Short write-ups about problems I hit while building, and how I solved them.
      </p>
      <a
        href="/notes/rss.xml"
        className="fx-rise mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-teal hover:text-snow"
        style={{ animationDelay: "240ms" }}
      >
        <Icon name="rss" className="h-4 w-4" />
        Subscribe with RSS
      </a>

      <NotesList notes={summaries} />
    </section>
  );
}
