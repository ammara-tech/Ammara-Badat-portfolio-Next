import type { PageSection } from "@/lib/page-nav";

/*
  "On this page": a row of links to the sections further down a long page, so visitors can
  see what's there and jump straight to it instead of scrolling to find it.
  Used on project pages, the case study (on phones and tablets; laptops have the sidebar),
  the About page and longer dev notes. Plain links to each heading's id, so it works with a
  keyboard, a screen reader and without JavaScript. Pass the list from onThisPage() in
  lib/page-nav.ts: with fewer than two sections it's empty and nothing is shown.
*/
export default function OnThisPage({ sections, className = "" }: { sections: PageSection[]; className?: string }) {
  if (sections.length === 0) return null;
  return (
    <nav aria-label="On this page" className={className}>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-mist">On this page</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-sm text-mist transition hover:border-teal hover:text-teal"
            >
              <span aria-hidden="true" className="text-teal">
                ↓
              </span>
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
