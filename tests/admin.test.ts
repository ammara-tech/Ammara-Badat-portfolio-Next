import { describe, expect, it } from "vitest";
import { matchesSearch, replyLink } from "@/lib/inbox";

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
