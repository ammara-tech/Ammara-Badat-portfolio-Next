import { projectStat, type Stat } from "@/lib/stats";

/*
  "By the numbers": the strip on the Home page, and the numbers on the For recruiters page.
  Every number is counted from real data (my projects in Supabase, content/notes.ts,
  content/certifications.ts, content/recruiters.ts and my Lighthouse scores in content/about.ts),
  so none of them can go out of date. Tested in tests/numbers.test.ts.
*/

export type NumberSources = {
  projects: number | null; // from Supabase; null if it couldn't be loaded
  liveApps: number;
  notes: number;
  certificates: number;
  accessibility: number; // my Lighthouse accessibility score
};

export function byTheNumbers(n: NumberSources): Stat[] {
  const projects = projectStat(n.projects); // left out, never a wrong number, if Supabase can't be reached
  return [
    ...(projects ? [projects] : []),
    { value: String(n.liveApps), label: "Live Firebase apps" },
    { value: String(n.notes), label: "Dev notes written" },
    { value: String(n.certificates), label: "Certifications" },
    { value: String(n.accessibility), label: "Lighthouse accessibility" },
  ];
}
