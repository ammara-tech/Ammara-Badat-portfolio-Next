"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { filterButtons, tagCounts, withTag } from "@/lib/note-tags";

/*
  The list of dev notes with a "Filter by topic" row, like the tech filter on the Projects page.
  The page (app/notes/page.tsx) passes only what the list shows, not the whole note text.
  The chosen topic is kept in the address (/notes?tag=Security), so a filtered list can be shared.
*/

export type NoteSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  updated?: string;
  updatedLabel?: string;
  minutes: number;
  tags: string[];
};

export default function NotesList({ notes }: { notes: NoteSummary[] }) {
  const [active, setActive] = useState<string | null>(null);
  const counts = useMemo(() => tagCounts(notes), [notes]);

  // Read ?tag= from the address on first load (any tag a note really has)
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tag");
    if (fromUrl && counts.some(([t]) => t === fromUrl)) setActive(fromUrl);
  }, [counts]);

  function choose(tag: string | null) {
    const next = tag === active ? null : tag;
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("tag", next);
    else url.searchParams.delete("tag");
    window.history.replaceState(null, "", url);
    setActive(next);
  }

  const visible = withTag(notes, active);
  const chip = (selected: boolean) =>
    `rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
      selected ? "border-racing bg-racing text-white" : "border-line-strong text-mist hover:border-teal hover:text-teal"
    }`;

  return (
    <>
      <div className="fx-rise mt-10" style={{ animationDelay: "300ms" }}>
        <p id="topic-label" className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-mist">
          <Icon name="tag" className="h-4 w-4 text-teal" />
          Filter by topic
        </p>
        <div role="group" aria-labelledby="topic-label" className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => choose(null)} aria-pressed={active === null} className={chip(active === null)}>
            All <span className="opacity-70">{notes.length}</span>
          </button>
          {filterButtons(counts, active).map(([tag, count]) => (
            <button key={tag} type="button" onClick={() => choose(tag)} aria-pressed={active === tag} className={chip(active === tag)}>
              {tag} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-mist" aria-live="polite">
          {active ? `Showing ${visible.length} of ${notes.length} notes about ${active}.` : `Showing all ${notes.length} notes.`}
        </p>
      </div>

      <ul className="mt-8 space-y-5">
        {visible.map((note) => (
          <li key={note.slug}>
            <Link
              href={`/notes/${note.slug}`}
              className="spotlight fx-reveal group block rounded-xl border border-line bg-panel p-6 transition hover:-translate-y-0.5 hover:border-teal/50 sm:p-7"
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-widest text-mist">
                <time dateTime={note.date}>{note.dateLabel}</time>
                {note.updated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      Updated <time dateTime={note.updated}>{note.updatedLabel}</time>
                    </span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{note.minutes} min read</span>
              </span>
              <span className="mt-3 block font-display text-2xl font-black uppercase leading-tight tracking-tight transition group-hover:text-teal sm:text-3xl">
                {note.title}
              </span>
              <span className="mt-2 block text-mist">{note.description}</span>
              <span className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                        tag === active ? "border-racing/60 text-snow" : "border-line-strong text-mist"
                      }`}
                    >
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
    </>
  );
}
