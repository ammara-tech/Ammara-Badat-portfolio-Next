import { describe, expect, it } from "vitest";
import { MIN_FILL_MS, checkContact } from "@/lib/contact";

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
