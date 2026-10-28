/*
  Helpers for the "you have unsaved changes" warning on the admin project form
  (components/UnsavedChangesGuard.tsx). Tested in tests/admin.test.ts.
*/

/** Which fields are different from what the form started with (spaces at the ends don't count) */
export function changedFields<T extends Record<string, string | boolean>>(form: T, start: T): (keyof T)[] {
  const norm = (v: string | boolean) => (typeof v === "string" ? v.trim() : v);
  return (Object.keys(start) as (keyof T)[]).filter((key) => norm(form[key]) !== norm(start[key]));
}

/**
 * Should clicking this link show the warning? Only for links that would leave the
 * current page in this tab: not new tabs, downloads, links to the same page
 * (like #headings), or Ctrl/Cmd-clicks, which open a new tab.
 */
export function leavesPage(
  link: { href: string; target?: string; download?: boolean },
  current: string,
  modifierKey = false,
): boolean {
  if (modifierKey || link.download || (link.target && link.target !== "_self")) return false;
  let to: URL;
  try {
    to = new URL(link.href, current);
  } catch {
    return false;
  }
  if (!/^https?:$/.test(to.protocol)) return false; // mailto:, tel: and similar open another app
  const from = new URL(current);
  return to.origin !== from.origin || to.pathname !== from.pathname || to.search !== from.search;
}
