import { describe, expect, it } from "vitest";
import { clockIn, localTimeLine } from "@/lib/local-time";
import { MIN_FILL_MS, checkContact } from "@/lib/contact";
import { hasText, readDraft } from "@/lib/contact-draft";

// A message a real person would send
const good = {
  name: "Thabo",
  email: "thabo@example.com",
  message: "Hi Ammara, I'd like to chat about a junior role.",
  website: "",
  elapsedMs: 8000,
};

describe("contact form spam protection", () => {
  it("accepts a normal message and trims extra spaces", () => {
    expect(checkContact({ ...good, name: "  Thabo  " })).toEqual({
      kind: "ok",
      name: "Thabo",
      email: good.email,
      message: good.message,
    });
  });

  it("treats a filled-in honeypot field as a bot", () => {
    expect(checkContact({ ...good, website: "https://spam.example" })).toEqual({ kind: "bot" });
  });

  it("treats a form sent in under 3 seconds as a bot", () => {
    expect(checkContact({ ...good, elapsedMs: MIN_FILL_MS - 1 })).toEqual({ kind: "bot" });
  });

  it("treats a missing or broken timer as a bot", () => {
    expect(checkContact({ ...good, elapsedMs: "not a number" })).toEqual({ kind: "bot" });
  });
});

describe("contact form field checks", () => {
  it("needs a name", () => {
    expect(checkContact({ ...good, name: "   " })).toEqual({ kind: "invalid", error: "Please enter your name." });
  });

  it("needs a valid email address", () => {
    expect(checkContact({ ...good, email: "not-an-email" })).toMatchObject({ kind: "invalid" });
  });

  it("needs a message of at least 10 characters", () => {
    expect(checkContact({ ...good, message: "hi" })).toMatchObject({ kind: "invalid" });
  });

  it("rejects a message over 3000 characters", () => {
    expect(checkContact({ ...good, message: "a".repeat(3001) })).toMatchObject({ kind: "invalid" });
  });
});

describe("contact form draft", () => {
  const now = Date.UTC(2026, 9, 28, 12, 0, 0);

  it("brings back a saved draft, including when the form was first opened", () => {
    const saved = JSON.stringify({ name: "Thabo", email: "", message: "Hi Ammara", startedAt: now - 60_000 });
    expect(readDraft(saved, now)).toEqual({ name: "Thabo", email: "", message: "Hi Ammara", startedAt: now - 60_000 });
  });

  it("ignores broken, empty or missing drafts, so the form starts empty", () => {
    expect(readDraft(null, now)).toBe(null);
    expect(readDraft("not json", now)).toBe(null);
    expect(readDraft(JSON.stringify({ name: "  ", email: "", message: "" }), now)).toBe(null);
    expect(hasText({ name: "", email: "", message: " " })).toBe(false);
  });

  it("cuts text to the form's limits and never trusts a start time from the future", () => {
    const draft = readDraft(JSON.stringify({ name: "x".repeat(500), message: 42, startedAt: now + 99_999 }), now);
    expect(draft?.name.length).toBe(100);
    expect(draft?.message).toBe("");
    expect(draft?.startedAt).toBe(now);
  });
});

describe("my local time on the Contact page", () => {
  // 11:16 UTC on 30 October 2026 is 13:16 in Johannesburg (UTC+2, no daylight saving)
  const moment = new Date("2026-10-30T11:16:00Z");

  it("shows Johannesburg time in 24-hour format", () => {
    expect(clockIn(moment, "Africa/Johannesburg")).toBe("13:16");
    expect(clockIn(new Date("2026-10-30T22:05:00Z"), "Africa/Johannesburg")).toBe("00:05");
  });

  it("adds the visitor's time only when it's different", () => {
    expect(localTimeLine(moment, "Africa/Johannesburg")).toBe("It's 13:16 here in Johannesburg");
    expect(localTimeLine(moment, "Europe/London")).toBe("It's 13:16 here in Johannesburg (11:16 where you are)");
  });
});
