import type { Project } from "@/lib/supabase";

/*
  Project page addresses. Kept in their own small file (no Supabase code)
  so the browser-side project cards can use them without loading the
  Supabase library.
*/

/** "F1 Race Hub 2026!" -> "f1-race-hub-2026". Each project's page address comes from its title. */
export function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // drop accents: é -> e
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Where a project's card should link: its case study if it has one, otherwise its own page. */
export function projectHref(project: Project) {
  return project.case_study_url || `/projects/${slugify(project.title)}`;
}
