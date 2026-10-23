import { describe, expect, it } from "vitest";
import { readingProgress } from "@/lib/reading";

// The bar at the top of a dev note: 0 = not started, 1 = finished
describe("reading progress on dev notes", () => {
  it("is empty at the top of the page", () => {
    expect(readingProgress(0, 0, 2000)).toBe(0);
  });

  it("is half full halfway through the note", () => {
    expect(readingProgress(1000, 0, 2000)).toBe(0.5);
  });

  it("never goes past full, even when scrolling into the footer", () => {
    expect(readingProgress(3500, 0, 2000)).toBe(1);
  });

  it("is full straight away for a note shorter than the screen", () => {
    expect(readingProgress(0, 0, -300)).toBe(1);
  });
});
