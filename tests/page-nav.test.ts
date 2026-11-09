import { describe, expect, it } from "vitest";
import { hasPageProgress, isLongPage, nextSectionIndex, onThisPage, showMoreBelow } from "@/lib/page-nav";

describe("On this page links", () => {
  it("lists the sections on the page, in order", () => {
    expect(
      onThisPage([
        { id: "how-title", label: "How it works" },
        { id: "then-title", label: "Then and now", show: false },
        { id: "more-title", label: "More projects" },
      ]),
    ).toEqual([
      { id: "how-title", label: "How it works" },
      { id: "more-title", label: "More projects" },
    ]);
  });

  it("shows nothing when there's only one section to jump to", () => {
    expect(onThisPage([{ id: "more-title", label: "More projects" }])).toEqual([]);
    expect(onThisPage([{ id: "a", label: "A" }, { id: "b", label: "B", show: false }])).toEqual([]);
  });
});

describe("More below hint", () => {
  it("shows at the top of a long page", () => {
    expect(showMoreBelow(0, 3000, 800)).toBe(true);
  });

  it("goes away once you start scrolling", () => {
    expect(showMoreBelow(120, 3000, 800)).toBe(false);
  });

  it("isn't shown when there's little or nothing below", () => {
    expect(showMoreBelow(0, 800, 800)).toBe(false);
    expect(showMoreBelow(0, 1100, 800)).toBe(false);
  });

  it("isn't shown in a window with no height (a hidden tab)", () => {
    expect(showMoreBelow(0, 3000, 0)).toBe(false);
  });

  it("jumps to the first heading in the bottom half of the screen or below", () => {
    expect(nextSectionIndex([-200, 100, 650, 1400], 800)).toBe(2);
    expect(nextSectionIndex([100, 200], 800)).toBe(-1);
  });
});

describe("Page progress bar", () => {
  it("is only shown on pages more than two screens tall", () => {
    expect(isLongPage(2400, 800)).toBe(true);
    expect(isLongPage(1500, 800)).toBe(false);
    expect(isLongPage(2400, 0)).toBe(false);
  });

  it("isn't added to dev notes (they have their own) or the admin area", () => {
    expect(hasPageProgress("/projects/papertrail")).toBe(true);
    expect(hasPageProgress("/notes")).toBe(true);
    expect(hasPageProgress("/notes/some-note")).toBe(false);
    expect(hasPageProgress("/admin")).toBe(false);
  });
});
