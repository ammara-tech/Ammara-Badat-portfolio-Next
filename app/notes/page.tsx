import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, notes, readingMinutes } from "@/content/notes";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Icon from "@/components/Icon";
import { Accent, Eyebrow, PageTitle } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Dev notes — Ammara Badat",
  description:
    "Short posts by Ammara Badat about what she built and learned: web performance, Supabase security, Next.js and more.",
  path: "/notes",
});

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

      <ul className="mt-12 space-y-5">
        {notes.map((note) => (
          <li key={note.slug}>
            <Link
              href={`/notes/${note.slug}`}
              className="spotlight fx-reveal group block rounded-xl border border-line bg-panel p-6 transition hover:-translate-y-0.5 hover:border-teal/50 sm:p-7"
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-widest text-mist">
                <time dateTime={note.date}>{formatDate(note.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes(note)} min read</span>
              </span>
              <span className="mt-3 block font-display text-2xl font-black uppercase leading-tight tracking-tight transition group-hover:text-teal sm:text-3xl">
                {note.title}
              </span>
              <span className="mt-2 block text-mist">{note.description}</span>
              <span className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-mist">
                      {tag}
                    </span>
                  ))}
                </span>
                <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-teal">
                  Read note
                  <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
