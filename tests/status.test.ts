import { describe, expect, it } from "vitest";
import { checkSite, healthOf, shortUrl, summary } from "@/lib/status";
import { lighthouseScores } from "@/content/status";

const clock = (...times: number[]) => () => times.shift() ?? 0;

describe("the status page", () => {
  it("sorts answers into up, slow and down", () => {
    expect(healthOf(true, 400)).toBe("up");
    expect(healthOf(true, 4500)).toBe("slow");
    expect(healthOf(false, 400)).toBe("down");
    expect(healthOf(true, null)).toBe("down");
  });

  it("times a site that answers", async () => {
    const c = await checkSite("https://a.example", async () => ({ ok: true, status: 200 }), clock(1000, 1250));
    expect(c).toEqual({ url: "https://a.example", health: "up", ms: 250, code: 200 });
  });

  it("counts an error page or no answer as down", async () => {
    expect((await checkSite("https://a.example", async () => ({ ok: false, status: 500 }), clock(0, 100))).health).toBe("down");
    const failed = await checkSite("https://a.example", async () => {
      throw new Error("timeout");
    });
    expect(failed).toEqual({ url: "https://a.example", health: "down", ms: null, code: null });
  });

  it("sums up all the sites", () => {
    expect(summary([{ health: "up" }, { health: "slow" }])).toBe("All 2 sites are up");
    expect(summary([{ health: "up" }, { health: "down" }])).toBe("1 of 2 sites are up");
    expect(summary([])).toBe("No sites to check");
  });

  it("shortens addresses", () => {
    expect(shortUrl("https://ticklist-pi.vercel.app/")).toBe("ticklist-pi.vercel.app");
  });

  it("only has real scores, with the date they were measured", () => {
    for (const s of Object.values(lighthouseScores)) {
      for (const n of [...Object.values(s.phone), ...Object.values(s.laptop)]) {
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(100);
      }
      expect(s.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
