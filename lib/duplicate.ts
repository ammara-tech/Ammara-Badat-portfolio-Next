import type { Project } from "@/lib/supabase";

/*
  "Duplicate" on /admin (components/ProjectOrderList.tsx): copies a project into the
  "Add a project" form, so a similar project can start from it. Nothing is saved until
  I press Add project, and the copy starts as a draft, so visitors can't see it by
  accident (drafts are hidden by RLS). Tested in tests/admin.test.ts.
*/

/** "Copy of MyFlix", or "Copy of MyFlix (2)" if that name is already used */
export function copyTitle(title: string, existingTitles: string[]) {
  const taken = new Set(existingTitles.map((t) => t.trim().toLowerCase()));
  const base = `Copy of ${title.trim()}`;
  if (!taken.has(base.toLowerCase())) return base;
  let n = 2;
  while (taken.has(`${base} (${n})`.toLowerCase())) n += 1;
  return `${base} (${n})`;
}

/** The form fields for a copy: same details and image, a new title, a draft, last in the order */
export function duplicateFields(project: Project, all: Project[]) {
  const lastPlace = Math.max(0, ...all.map((p) => p.sort_order));
  return {
    title: copyTitle(project.title, all.map((p) => p.title)),
    summary: project.summary ?? "",
    live_url: project.live_url ?? "",
    repo_url: project.repo_url ?? "",
    image_url: project.image_url ?? "",
    video_url: project.video_url ?? "",
    case_study_url: project.case_study_url ?? "",
    tags: project.tags.join(", "),
    sort_order: String(lastPlace + 1),
    published: false,
  };
}
