/*
  The tag filter on the Dev notes page (components/NotesList.tsx).
  Kept here, away from the component, so it can be tested (tests/content.test.ts).
*/

type Tagged = { tags: string[] };

/** Every tag with how many notes use it, most used first (ties in A to Z order) */
export function tagCounts(items: Tagged[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of items) for (const tag of new Set(item.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/**
 * The tags shown as filter buttons: the ones used by at least two notes, so the row stays short.
 * A one-note tag still appears while it's chosen (e.g. from a shared /notes?tag=Firebase link).
 */
export function filterButtons(counts: [string, number][], active: string | null): [string, number][] {
  return counts.filter(([tag, n]) => n >= 2 || tag === active);
}

/** The notes with that tag, or all of them when no tag is chosen */
export function withTag<T extends Tagged>(items: T[], tag: string | null): T[] {
  return tag ? items.filter((item) => item.tags.includes(tag)) : items;
}

type Note = Tagged & { slug: string; date: string };

/**
 * "Related notes" at the end of a note: the notes sharing the most topics with it.
 * When they share the same number, the note's first topic counts most (a note's
 * topics are listed main topic first), then the newest note wins. Notes already linked as Older/Newer
 * are left out, so the same note isn't offered twice. Notes sharing no topic never appear.
 */
export function relatedNotes<T extends Note>(all: T[], slug: string, skip: string[] = [], max = 3): (T & { shared: string[] })[] {
  const current = all.find((n) => n.slug === slug);
  if (!current) return [];
  const weight = (shared: string[]) => shared.reduce((sum, t) => sum + (current.tags.length - current.tags.indexOf(t)), 0);
  return all
    .filter((n) => n.slug !== slug && !skip.includes(n.slug))
    .map((n) => ({ ...n, shared: current.tags.filter((t) => n.tags.includes(t)) })) // in the current note's order
    .filter((n) => n.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length || weight(b.shared) - weight(a.shared) || b.date.localeCompare(a.date))
    .slice(0, max);
}
