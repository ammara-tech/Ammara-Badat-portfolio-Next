import { describe, expect, it } from "vitest";
import { matchesSearch, replyLink } from "@/lib/inbox";
import { describe as describeActivity, groupActivity, timeAgo } from "@/lib/activity";
import { idleState } from "@/lib/idle";
import type { ActivityEntry } from "@/lib/supabase";

// A message like one sent from the Contact page
const msg = {
  name: "Thabo Mokoena",
  email: "thabo@example.com",
  message: "Hi Ammara,\nI'd like to chat about a junior role.",
};

describe("admin inbox: search", () => {
  it("finds a message by name, email or text, whatever the capitals", () => {
    expect(matchesSearch(msg, "THABO")).toBe(true);
    expect(matchesSearch(msg, "example.com")).toBe(true);
    expect(matchesSearch(msg, "junior role")).toBe(true);
  });

  it("shows everything when the search box is empty", () => {
    expect(matchesSearch(msg, "   ")).toBe(true);
  });

  it("hides messages that don't match", () => {
    expect(matchesSearch(msg, "invoice")).toBe(false);
  });
});

describe("admin inbox: Reply button", () => {
  const link = decodeURIComponent(replyLink(msg));

  it("writes to the sender with a subject", () => {
    expect(link.startsWith("mailto:thabo@example.com?subject=Re: your message on my portfolio")).toBe(true);
  });

  it("greets them by first name and quotes their message", () => {
    expect(link).toContain("Hi Thabo,");
    expect(link).toContain("> Hi Ammara,\n> I'd like to chat about a junior role.");
  });
});

describe("admin activity log", () => {
  const entry = (id: number, action: ActivityEntry["action"], seconds: number, details: string | null = null): ActivityEntry => ({
    id,
    action,
    project_id: null,
    project_title: "MyFlix",
    details,
    created_at: new Date(Date.UTC(2026, 9, 24, 12, 0, seconds)).toISOString(),
  });

  it("describes each change in plain words", () => {
    expect(describeActivity({ ...entry(1, "edited", 0, "summary, tags"), count: 1 })).toBe("Edited MyFlix (summary, tags)");
    expect(describeActivity({ ...entry(2, "unpublished", 0), count: 1 })).toBe("Moved MyFlix to drafts");
    expect(describeActivity({ ...entry(3, "added", 0, "as a draft"), count: 1 })).toBe("Added MyFlix as a draft");
  });

  it("groups the reorders from one drag into a single line", () => {
    const grouped = groupActivity([entry(4, "reordered", 3), entry(3, "reordered", 2), entry(2, "reordered", 2), entry(1, "edited", 1)]);
    expect(grouped.map((g) => [g.action, g.count])).toEqual([["reordered", 3], ["edited", 1]]);
    expect(describeActivity(grouped[0])).toBe("Changed the project order (3 projects moved)");
  });

  it("says how long ago something happened", () => {
    const now = Date.UTC(2026, 9, 24, 12, 0, 0);
    expect(timeAgo(new Date(now - 20_000).toISOString(), now)).toBe("just now");
    expect(timeAgo(new Date(now - 5 * 60_000).toISOString(), now)).toBe("5 min ago");
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe("3 h ago");
    expect(timeAgo(new Date(now - 30 * 3_600_000).toISOString(), now)).toBe("yesterday");
  });
});

describe("admin auto sign-out", () => {
  const start = 1_000_000;
  const minutes = (m: number) => start + m * 60_000;

  it("does nothing while I'm active", () => {
    expect(idleState(minutes(10), start)).toEqual({ kind: "active" });
  });

  it("warns in the last minute with a countdown", () => {
    expect(idleState(minutes(29.5), start)).toEqual({ kind: "warning", secondsLeft: 30 });
  });

  it("signs out after 30 minutes, even if the laptop was asleep for hours", () => {
    expect(idleState(minutes(30), start)).toEqual({ kind: "expired" });
    expect(idleState(minutes(300), start)).toEqual({ kind: "expired" });
  });
});
