/*
  Helping visitors see everything on a long page, without forcing them to scroll:
  - "On this page" links (components/OnThisPage.tsx)
  - the "More below" hint at the bottom of the first screen (components/MoreBelow.tsx)
  - the progress bar at the top of long pages (components/PageProgress.tsx)
  Kept apart from the components so the rules can be tested (tests/page-nav.test.ts).
*/

export type PageSection = { id: string; label: string };

/** The sections to link to: the ones on this page, in order. Links only help with two or more. */
export function onThisPage(sections: (PageSection & { show?: boolean })[]): PageSection[] {
  const shown = sections.filter((s) => s.show !== false && s.id && s.label).map(({ id, label }) => ({ id, label }));
  return shown.length >= 2 ? shown : [];
}

/**
  The "More below" hint shows only at the top of the page (before any real scrolling),
  and only when there's at least half a screen more to see underneath.
*/
export function showMoreBelow(scrollY: number, pageHeight: number, screenHeight: number) {
  if (screenHeight <= 0) return false;
  return scrollY < 40 && pageHeight - screenHeight > screenHeight * 0.5;
}

/** The progress bar is only for long pages: more than two screens tall. */
export function isLongPage(pageHeight: number, screenHeight: number) {
  return screenHeight > 0 && pageHeight > screenHeight * 2;
}

/** Note pages have their own reading bar, and the admin area doesn't need one. */
export function hasPageProgress(pathname: string) {
  return !pathname.startsWith("/admin") && !/^\/notes\/[^/]+\/?$/.test(pathname);
}

/**
  Where "More below" takes you: the first section heading that starts in the bottom half of
  the screen or further down (so the jump always moves you to something new).
  tops are each heading's distance from the top of the screen, in page order.
*/
export function nextSectionIndex(tops: number[], screenHeight: number) {
  return tops.findIndex((top) => top > screenHeight * 0.5);
}
