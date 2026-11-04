import type { Project } from "@/lib/supabase";
import type { CvProject } from "@/content/cv";
import { projectHref } from "@/lib/slug";

/*
  "More projects" on my CV page and in the CV PDF.
  My main projects have hand-written bullet points in content/cv.ts. Every other project I've
  published in /admin is added here automatically, one line each, so a new project shows up on
  my CV without me editing anything. The CV page and PDF check for new projects every 10 minutes.
  Tested in tests/cv-pdf.test.ts.
*/

export type CvExtra = { title: string; summary: string; links: { label: string; href: string }[] };

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

/**
 * The published projects that aren't already on my CV with bullet points.
 * A project counts as "already on my CV" if its live site or code address is one of the
 * links on a main project, because the titles don't always match (Next.js Dashboard is
 * the Family Clinic Platform on my CV).
 */
export function moreProjects(main: CvProject[], all: Project[]): CvExtra[] {
  const onCv = new Set(main.flatMap((p) => p.links.map((l) => sameAddress(l.href))));
  return all
    .filter((p) => p.published !== false)
    .filter((p) => ![p.live_url, p.repo_url].some((url) => url && onCv.has(sameAddress(url))))
    .map((p) => ({
      title: p.title,
      summary: p.summary ? firstSentence(p.summary) : "",
      links: [
        ...(p.live_url ? [{ label: "Live", href: p.live_url }] : []),
        ...(p.repo_url ? [{ label: "Code", href: p.repo_url }] : []),
        ...(!p.live_url && !p.repo_url ? [{ label: "Details", href: projectHref(p) }] : []),
      ],
    }));
}
