/*
  Reading progress for a dev note, as a number from 0 (not started) to 1 (finished).

  start: how far down the page the note begins (in pixels)
  end:   how far you have to scroll for the last paragraph to reach the bottom of the screen
  Kept separate from the component so it can be tested (tests/reading.test.ts).
*/
export function readingProgress(scrollY: number, start: number, end: number) {
  if (end <= start) return scrollY >= start ? 1 : 0; // a note shorter than the screen
  return Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
}
