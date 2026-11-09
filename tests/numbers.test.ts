import { describe, expect, it } from "vitest";
import { byTheNumbers } from "@/lib/numbers";

const sources = { projects: 12, liveApps: 5, notes: 39, certificates: 4, accessibility: 100 };

describe("by the numbers", () => {
  it("shows five numbers from real data", () => {
    expect(byTheNumbers(sources).map((s) => s.value)).toEqual(["12", "5", "39", "4", "100"]);
  });

  it("leaves the project count out, never a wrong number, if Supabase can't be reached", () => {
    const stats = byTheNumbers({ ...sources, projects: null });
    expect(stats).toHaveLength(4);
    expect(stats[0].label).toBe("Live Firebase apps");
  });
});
