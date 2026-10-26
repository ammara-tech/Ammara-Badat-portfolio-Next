import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findNote, formatDate, headingIds, lastChanged, noteNeighbours, notes, readingMinutes, type Block } from "@/content/notes";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import ReadingProgress from "@/components/ReadingProgress";
import Icon from "@/components/Icon";
import { card } from "@/components/ui";

/* One dev note, e.g. /notes/lighthouse-74-to-96. The text lives in content/notes.ts. */

type Props = { params: Promise<{ slug: string }> };

// Build every note as a static page when the site is deployed (fastest possible)
export function generateStaticParams() {
  return notes.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = findNote(slug);
  if (!note) return { title: "Note not found — Ammara Badat", robots: { index: false } };
  return pageMetadata({
    title: `${note.title} — Ammara Badat`,
    description: note.description,
    path: `/notes/${note.slug}`,
    type: "article",
  });
}

function Content({ block, id }: { block: Block; id: string | null }) {
  switch (block.type) {
    case "h2":
      // Each sub-heading has its own address (#its-words). The # link shows on hover or keyboard focus
      // (and faintly on touch screens), so readers can link straight to a section.
      // scroll-mt-24 stops the sticky navbar covering the heading when you jump to it.
      return (
        <h2 id={id ?? undefined} className="group scroll-mt-24 pt-4 font-display text-2xl font-black uppercase tracking-tight text-snow">
          {block.text}
          {id && (
            <a
              href={`#${id}`}
              aria-label={`Link to this section: ${block.text}`}
              className="ml-3 inline-block font-mono text-xl text-teal no-underline opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-50"
            >
              #
            </a>
          )}
        </h2>
      );
    case "ul":
      return (
        <ul className="space-y-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-racing" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <figure className="overflow-hidden rounded-xl border border-line-strong bg-panel">
          <figcaption className="border-b border-line bg-panel-alt px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-mist">
            {block.lang}
          </figcaption>
          {/* tabIndex lets keyboard users scroll long lines sideways */}
          <pre tabIndex={0} aria-label={`${block.lang} code example`} className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-snow">
            <code>{block.code}</code>
          </pre>
        </figure>
      );
    case "tip":
      return (
        <p className="rounded-xl border-l-[3px] border-teal bg-teal/10 p-4 text-snow">
          <span className="mr-2 font-mono text-xs font-bold uppercase tracking-widest text-teal">Takeaway</span>
          {block.text}
        </p>
      );
    default:
      return <p>{block.text}</p>;
  }
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = findNote(slug);
  if (!note) notFound();

  const { older, newer } = noteNeighbours(note.slug);
  const ids = headingIds(note.body);

  return (
    <article className="mx-auto max-w-3xl">
      <ReadingProgress targetId="note-body" />
      <JsonLd
        data={[
          breadcrumbs([
            { name: "Dev notes", path: "/notes" },
            { name: note.title, path: `/notes/${note.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: note.title,
            description: note.description,
            datePublished: note.date,
            dateModified: lastChanged(note),
            url: `${siteUrl}/notes/${note.slug}`,
            keywords: note.tags.join(", "),
            author: personRef,
            publisher: personRef,
            mainEntityOfPage: `${siteUrl}/notes/${note.slug}`,
          },
        ]}
      />

      <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-widest text-mist">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-teal">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/notes" className="hover:text-teal">
              Dev notes
            </Link>
          </li>
        </ol>
      </nav>

      <header className="mt-8">
        <p className="fx-rise flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-widest text-teal">
          <time dateTime={note.date}>{formatDate(note.date)}</time>
          {note.updated && (
            <>
              <span aria-hidden="true" className="text-mist">
                ·
              </span>
              <span className="text-mist">
                Updated <time dateTime={note.updated}>{formatDate(note.updated)}</time>
              </span>
            </>
          )}
          <span aria-hidden="true" className="text-mist">
            ·
          </span>
          <span>{readingMinutes(note)} min read</span>
        </p>
        <h1
          className="fx-rise mt-3 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl"
          style={{ animationDelay: "90ms" }}
        >
          {note.title}
        </h1>
        <p className="fx-rise mt-5 text-xl leading-relaxed text-mist" style={{ animationDelay: "160ms" }}>
          {note.description}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {note.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-mist">
              {tag}
            </li>
          ))}
        </ul>
        <div aria-hidden="true" className="mt-8 h-1 w-40 rounded-full bg-linear-to-r from-racing to-teal" />
      </header>

      <div id="note-body" className="mt-10 space-y-5 text-lg leading-relaxed text-mist">
        {note.body.map((block, i) => (
          <Content key={i} block={block} id={ids[i]} />
        ))}
      </div>

      <footer className={`${card} mt-14 flex flex-wrap items-center justify-between gap-4 p-6`}>
        <p className="text-snow">Thanks for reading! Questions or feedback?</p>
        <Link href="/contact" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-teal">
          Get in touch
          <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </footer>

      {/* Older and newer notes, so readers can move through them like a blog */}
      {(older || newer) && (
        <nav aria-label="More dev notes" className="mt-14 grid gap-4 sm:grid-cols-2">
          {older && (
            <Link
              href={`/notes/${older.slug}`}
              className={`${card} spotlight group block h-full p-5 transition hover:-translate-y-0.5 hover:border-teal/50`}
            >
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist">
                <Icon name="arrow-left" className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                Older note
              </span>
              <span className="mt-2 block font-display text-lg font-black uppercase leading-tight tracking-tight group-hover:text-teal">
                {older.title}
              </span>
            </Link>
          )}
          {newer && (
            <Link
              href={`/notes/${newer.slug}`}
              className={`${card} spotlight group block h-full p-5 transition hover:-translate-y-0.5 hover:border-teal/50 sm:col-start-2 sm:text-right`}
            >
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-mist sm:justify-end">
                Newer note
                <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="mt-2 block font-display text-lg font-black uppercase leading-tight tracking-tight group-hover:text-teal">
                {newer.title}
              </span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
