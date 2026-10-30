import { describe, expect, it } from "vitest";
import { addBadge, badgeLabel } from "@/lib/tab-badge";
import { changedFields, leavesPage } from "@/lib/unsaved";
import { matchesSearch, replyLink, unreadIds } from "@/lib/inbox";
import { countByKind, describe as describeActivity, filterActivity, groupActivity, timeAgo } from "@/lib/activity";
import { idleState } from "@/lib/idle";
import { leftTooLongAgo } from "@/lib/admin-session";
import { cleanCode, nextStep } from "@/lib/two-step";
import { csvCell, csvFileName, messagesCsv } from "@/lib/csv";
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

  it("describes new and deleted messages by the sender's name only", () => {
    const msg = { ...entry(5, "received", 0), kind: "message" as const, project_title: "Thabo", count: 1 };
    expect(describeActivity(msg)).toBe("New message from Thabo");
    expect(describeActivity({ ...msg, action: "deleted" })).toBe("Deleted the message from Thabo");
  });

  it("describes uploaded and deleted images by file name", () => {
    const img = { ...entry(6, "uploaded", 0), kind: "image" as const, project_title: "cover.png", count: 1 };
    expect(describeActivity(img)).toBe("Uploaded the image cover.png");
    expect(describeActivity({ ...img, action: "deleted" })).toBe("Deleted the image cover.png");
  });

  it("filters by kind, and treats older entries without a kind as projects", () => {
    const list: ActivityEntry[] = [
      { ...entry(9, "uploaded", 3), kind: "image" },
      { ...entry(8, "received", 2), kind: "message" },
      entry(7, "edited", 1), // logged before the kind column existed
    ];
    expect(filterActivity(list, "all").map((e) => e.id)).toEqual([9, 8, 7]);
    expect(filterActivity(list, "project").map((e) => e.id)).toEqual([7]);
    expect(filterActivity(list, "message").map((e) => e.id)).toEqual([8]);
    expect(filterActivity(list, "image").map((e) => e.id)).toEqual([9]);
  });

  it("counts each kind for the numbers on the filter buttons", () => {
    const list: ActivityEntry[] = [
      { ...entry(12, "received", 3), kind: "message" },
      { ...entry(11, "received", 2), kind: "message" },
      { ...entry(10, "uploaded", 1), kind: "image" },
      entry(9, "edited", 0), // no kind: counts as a project
    ];
    expect(countByKind(list)).toEqual({ all: 4, project: 1, message: 2, image: 1 });
    expect(countByKind([])).toEqual({ all: 0, project: 0, message: 0, image: 0 });
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

describe("admin sign-in stays in one tab", () => {
  const now = 1_000_000;

  it("stays signed in after a normal refresh (about a second)", () => {
    expect(leftTooLongAgo(now - 1200, now)).toBe(false);
  });

  it("signs out when a closed tab is reopened later", () => {
    expect(leftTooLongAgo(now - 60_000, now)).toBe(true);
  });

  it("does nothing when the tab was never closed", () => {
    expect(leftTooLongAgo(null, now)).toBe(false);
  });
});

describe("admin two-step sign-in", () => {
  it("asks for the authenticator code after the password", () => {
    expect(nextStep({ currentLevel: "aal1", nextLevel: "aal2" })).toBe("code");
  });

  it("makes me set up an authenticator app if there isn't one yet", () => {
    expect(nextStep({ currentLevel: "aal1", nextLevel: "aal1" })).toBe("setup");
  });

  it("only shows the dashboard after both steps", () => {
    expect(nextStep({ currentLevel: "aal2", nextLevel: "aal2" })).toBe("dashboard");
  });

  it("accepts a pasted code with spaces, and never more than 6 digits", () => {
    expect(cleanCode("123 456")).toBe("123456");
    expect(cleanCode("12a34567")).toBe("123456");
  });
});

describe("admin inbox: Download CSV", () => {
  it("wraps cells with commas, quotes or line breaks, and doubles the quotes", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell('Hi, I said "hello"\nBye')).toBe('"Hi, I said ""hello""\nBye"');
  });

  it("stops a message from running as a spreadsheet formula", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+27 60 000 0000")).toBe("'+27 60 000 0000");
    expect(csvCell("@everyone")).toBe("'@everyone");
  });

  it("has a header row and one row per message", () => {
    const csv = messagesCsv([
      { name: "Thabo", email: "thabo@example.com", message: "Hello, Ammara", is_read: false, created_at: "2026-10-26T10:00:00Z" },
    ]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe("Sent,Name,Email,Message,Read");
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain('Thabo,thabo@example.com,"Hello, Ammara",No');
  });

  it("names the file after the day it was downloaded", () => {
    expect(csvFileName(new Date(2026, 9, 6))).toBe("messages-2026-10-06.csv");
  });
});

describe("admin tab icon badge", () => {
  const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64"/></svg>';

  it("leaves the icon unchanged with no unread messages", () => {
    expect(addBadge(icon, 0)).toBe(icon);
    expect(badgeLabel(-1)).toBe("");
  });

  it("adds the number inside the icon, and 9+ for ten or more", () => {
    const three = addBadge(icon, 3);
    expect(three).toContain(">3</text>");
    expect(three.endsWith("</svg>")).toBe(true);
    expect(three).toContain('<rect width="64" height="64"/>'); // the original logo is still there
    expect(three).toContain("scale(0.7)"); // ...made smaller, so the badge doesn't cover it
    expect(badgeLabel(12)).toBe("9+");
  });
});

describe("admin unsaved changes warning", () => {
  const start = { title: "MyFlix", tags: "React", published: true };

  it("notices changed fields, but not extra spaces", () => {
    expect(changedFields(start, start)).toEqual([]);
    expect(changedFields({ ...start, title: "MyFlix " }, start)).toEqual([]);
    expect(changedFields({ ...start, tags: "React, CSS", published: false }, start)).toEqual(["tags", "published"]);
  });

  it("warns for links that leave the page in this tab", () => {
    const here = "https://example.com/admin";
    expect(leavesPage({ href: "/projects" }, here)).toBe(true);
    expect(leavesPage({ href: "https://github.com/" }, here)).toBe(true);
  });

  it("doesn't warn for new tabs, Ctrl-clicks, same-page links or email links", () => {
    const here = "https://example.com/admin";
    expect(leavesPage({ href: "https://github.com/", target: "_blank" }, here)).toBe(false);
    expect(leavesPage({ href: "/projects" }, here, true)).toBe(false);
    expect(leavesPage({ href: "#inbox-title" }, here)).toBe(false);
    expect(leavesPage({ href: "mailto:someone@example.com" }, here)).toBe(false);
  });
});

describe("admin inbox: Mark all read", () => {
  const list = [
    { id: "a", is_read: false },
    { id: "b", is_read: true },
    { id: "c", is_read: false },
  ];

  it("changes only the unread messages", () => {
    expect(unreadIds(list)).toEqual(["a", "c"]);
  });

  it("leaves out a message that is waiting for Undo delete", () => {
    expect(unreadIds(list, "c")).toEqual(["a"]);
  });

  it("has nothing to do when everything is read", () => {
    expect(unreadIds([{ id: "b", is_read: true }])).toEqual([]);
  });
});
