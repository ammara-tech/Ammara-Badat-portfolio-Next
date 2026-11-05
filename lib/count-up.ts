/*
  What the counting numbers on the About page count to (components/CountUp.tsx).
  "10+" counts up to 10 and keeps the "+". A year like "2026", or text with no number at
  the start, isn't counted: it's shown as it is. Tested in tests/content.test.ts.
*/
export function splitCount(value: string): { target: number; suffix: string } | null {
  // 1 to 3 digits, then nothing or something that isn't a digit
  const match = value.match(/^(\d{1,3})(\D.*)?$/);
  return match ? { target: Number(match[1]), suffix: match[2] ?? "" } : null;
}
