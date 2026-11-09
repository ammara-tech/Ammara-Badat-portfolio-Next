import { describe, expect, it } from "vitest";
import { checkEntry, MESSAGE_MAX } from "@/lib/guestbook";

const human = { name: "Naledi", message: "Lovely portfolio, well done!", website: "", elapsedMs: 8000 };

describe("the guestbook's checks", () => {
  it("accepts a normal message, tidying the name", () => {
    expect(checkEntry({ ...human, name: "  Naledi   M " })).toEqual({ kind: "ok", name: "Naledi M", message: "Lovely portfolio, well done!" });
  });

  it("quietly ignores bots: the hidden field filled in, or sent too fast", () => {
    expect(checkEntry({ ...human, website: "spam" }).kind).toBe("bot");
    expect(checkEntry({ ...human, elapsedMs: 500 }).kind).toBe("bot");
  });

  it("explains what's wrong to a real person", () => {
    expect(checkEntry({ ...human, name: " " })).toMatchObject({ kind: "invalid" });
    expect(checkEntry({ ...human, message: "x" })).toMatchObject({ kind: "invalid" });
    expect(checkEntry({ ...human, message: "a".repeat(MESSAGE_MAX + 1) })).toMatchObject({ kind: "invalid" });
  });

  it("doesn't take links", () => {
    expect(checkEntry({ ...human, message: "Visit https://cheap.example" }).kind).toBe("invalid");
    expect(checkEntry({ ...human, message: "go to www.spam.net now" }).kind).toBe("invalid");
    expect(checkEntry({ ...human, message: "buy at spammy.ru" }).kind).toBe("invalid");
    expect(checkEntry({ ...human, message: "I loved the Next.js part" }).kind).toBe("ok");
  });
});
