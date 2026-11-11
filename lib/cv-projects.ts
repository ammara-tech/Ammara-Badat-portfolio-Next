import type { Project } from "@/lib/supabase";
import type { CvProject } from "@/content/cv";
import { projectHref } from "@/lib/slug";

/*
  The projects on my CV page and in the CV PDF, worked out from what I've published in /admin,
  so my CV keeps itself up to date. The CV page and PDF check for new projects every 10 minutes.
  - My first main projects (the capstone and this site) always come first, with the bullet
    points I wrote in content/cv.ts.
  - Then my newest published projects, in full: their tags as the stack, and their summary as
    the points. A new project goes straight to the top part of my CV by itself.
  - Everything else is under "More projects", one line each with its tags: older main projects
    (with their hand-written line) and the rest of my published projects, newest first.
  Tested in tests/cv-pdf.test.ts.
*/

export type CvExtra = { title: string; summary: string; tags: string[]; links: { label: string; href: string }[] };

/** "https://www.Example.com/x/" and "example.com/x" are the same address */
export function sameAddress(url: string) {
  return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
}

/** Just the first sentence, so each extra project fits on one line */
export function firstSentence(text: string) {
  const t = text.trim().replace(/\s+/g, " ");
  const match = t.match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : t).replace(/[.!?]$/, "");
}

/** A summary split into its sentences (without the full stops), for bullet points */
export function sentences(text: string) {
  const out: string[] = [];
  let rest = text.trim().replace(/\s+/g, " ");
  while (rest) {
    const first = firstSentence(rest);
    out.push(first);
    rest = rest.slice(rest.indexOf(first) + first.length).replace(/^[.!?]\s*/, "");
  }
  // Leave out scraps like "Next.js + Firebase" at the end: a point needs a few words
  return out.filter((s) => s.split(" ").length >= 4);
}

// Full entries also link to the project's page on my site; one-line entries only need Live and Code
const linksOf = (p: Project, details = true) => [
  ...(p.live_url ? [{ label: "Live", href: p.live_url }] : []),
  ...(p.repo_url ? [{ label: "Code", href: p.repo_url }] : []),
  ...(details || (!p.live_url && !p.repo_url) ? [{ label: "Details", href: projectHref(p) }] : []),
];

/** Newest first; projects without a date keep their /admin order at the end */
const newest = (list: Project[]) => [...list].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

export type CvLayout = { projects: CvProject[]; extra: CvExtra[] };

/**
 * Everything for the Projects and More projects sections.
 * keep: how many of my hand-written main projects always stay at the top in full.
 * featured: how many of my newest published projects are shown in full after them.
 */
export function cvProjects(main: CvProject[], all: Project[], keep = 2, featured = 3): CvLayout {
  const others = newest(moreFromAdmin(main, all));
  const fresh = others.slice(0, featured);
  const full: CvProject[] = fresh.map((p) => ({
    title: p.title,
    links: linksOf(p),
    stack: p.tags.join(", "),
    points: sentences(p.summary ?? "").slice(0, 2),
  }));
  const demoted: CvExtra[] = main.slice(keep).map((p) => ({ title: p.title, summary: firstSentence(p.points[0] ?? ""), tags: p.stack.split(",").map((t) => t.trim()).filter(Boolean), links: p.links }));
  const rest: CvExtra[] = others.slice(featured).map((p) => ({ title: p.title, summary: p.summary ? firstSentence(p.summary) : "", tags: p.tags, links: linksOf(p, false) }));
  return { projects: [...main.slice(0, keep), ...full], extra: [...rest, ...demoted] };
}

/** The published projects that aren't already one of my hand-written main projects */
function moreFromAdmin(main: CvProject[], all: Project[]) {
  const onCv = new Set(main.flatMap((p) => p.links.map((l) => sameAddress(l.href))));
  return all.filter((p) => p.published !== false).filter((p) => ![p.live_url, p.repo_url].some((url) => url && onCv.has(sameAddress(url))));
}

/**
 * The published projects that aren't already on my CV with bullet points.
 * A project counts as "already on my CV" if its live site or code address is one of the
 * links on a main project, because the titles don't always match (Next.js Dashboard is
 * the Family Clinic Platform on my CV).
 */
export function moreProjects(main: CvProject[], all: Project[]): CvExtra[] {
  return moreFromAdmin(main, all)
    .map((p) => ({
      title: p.title,
      summary: p.summary ? firstSentence(p.summary) : "",
      tags: p.tags,
      links: [
        ...(p.live_url ? [{ label: "Live", href: p.live_url }] : []),
        ...(p.repo_url ? [{ label: "Code", href: p.repo_url }] : []),
        ...(!p.live_url && !p.repo_url ? [{ label: "Details", href: projectHref(p) }] : []),
      ],
    }));
}
