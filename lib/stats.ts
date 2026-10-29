/*
  The "Projects built & shipped" number on the About page.
  It's counted live from Supabase, so adding (and publishing) a project in /admin
  updates it by itself. Drafts aren't counted: the About page reads as a visitor,
  and RLS only shows visitors published projects.
*/

export type Stat = { value: string; label: string };

export const PROJECTS_LABEL = "Projects built & shipped";

/** The stat card for my project count, or null if the count couldn't be loaded (the card is then left out, never a wrong number) */
export function projectStat(count: number | null): Stat | null {
  if (count === null || !Number.isFinite(count) || count < 1) return null;
  return { value: String(Math.floor(count)), label: PROJECTS_LABEL };
}
