/*
  The contact form keeps a draft while a visitor types (components/ContactForm.tsx),
  so a refresh or an accidental Back doesn't lose their message.

  Where: sessionStorage, which belongs to that one browser tab and is wiped
  when the tab closes. Nothing is sent anywhere until they press Send, and the
  draft is deleted once the message is sent. The hidden spam field is never saved.
  Tested in tests/contact.test.ts.
*/

export type ContactDraft = { name: string; email: string; message: string; startedAt: number };

export const DRAFT_KEY = "contact-draft";

const LIMITS = { name: 100, email: 200, message: 3000 } as const;

/** True if the visitor has typed anything worth keeping */
export function hasText(d: Pick<ContactDraft, "name" | "email" | "message">): boolean {
  return Boolean(d.name.trim() || d.email.trim() || d.message.trim());
}

/**
 * Reads a saved draft safely. Anything broken, too long, from the future or
 * empty gives null, so the form simply starts empty.
 */
export function readDraft(raw: string | null, now = Date.now()): ContactDraft | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  const text = (key: keyof typeof LIMITS) =>
    typeof d[key] === "string" ? (d[key] as string).slice(0, LIMITS[key]) : "";
  const startedAt = typeof d.startedAt === "number" && d.startedAt > 0 && d.startedAt <= now ? d.startedAt : now;
  const draft = { name: text("name"), email: text("email"), message: text("message"), startedAt };
  return hasText(draft) ? draft : null;
}
