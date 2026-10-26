/*
  Whether the site's own Back and Forward buttons can be used (components/NavArrows.tsx).

  Newer browsers (Chrome and Edge) have the Navigation API, which says exactly whether
  there is a page to go back or forward to. Other browsers don't, so then Back works
  if this tab has visited more than one page, and Forward is always allowed (if there's
  nothing to go forward to, pressing it simply does nothing).
  Tested in tests/content.test.ts.
*/

export type NavigationInfo = { canGoBack: boolean; canGoForward: boolean } | null | undefined;

export function historyButtons(navigation: NavigationInfo, historyLength: number) {
  if (navigation) return { canBack: navigation.canGoBack, canForward: navigation.canGoForward };
  return { canBack: historyLength > 1, canForward: true };
}
