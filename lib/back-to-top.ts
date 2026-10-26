/*
  When the back-to-top button shows (components/BackToTop.tsx).
  Only after scrolling more than one and a half screens down, so short pages never show it.
  Tested in tests/content.test.ts.
*/
export function showBackToTop(scrollY: number, screenHeight: number) {
  return scrollY > screenHeight * 1.5;
}
