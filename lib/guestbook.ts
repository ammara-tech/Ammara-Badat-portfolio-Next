import { MIN_FILL_MS } from "@/lib/contact";

/*
  The guestbook's checks, kept apart from the API route (app/api/guestbook/route.ts) so they can
  be tested on their own (tests/guestbook.test.ts). The same lengths as the database
  (Supabase/011-guestbook.sql), so people get a friendly message instead of an error.
*/

export const NAME_MAX = 60;
export const MESSAGE_MAX = 280;

export type GuestbookEntry = { id: string; name: string; message: string; approved: boolean; created_at: string };

export type GuestbookCheck =
  | { kind: "bot" } // honeypot filled in, or sent too fast: quietly ignored
  | { kind: "invalid"; error: string }
  | { kind: "ok"; name: string; message: string };

// Links are the main thing spam is made of, so the guestbook doesn't take any
const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|ru|xyz|top|co\.za)\b)/i;

export function checkEntry(body: Record<string, unknown>): GuestbookCheck {
  const name = String(body.name ?? "").replace(/\s+/g, " ").trim();
  const message = String(body.message ?? "").trim();
  const honeypot = String(body.website ?? "");
  const elapsed = Number(body.elapsedMs ?? 0);

  if (honeypot !== "" || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return { kind: "bot" };
  if (name.length < 1 || name.length > NAME_MAX) return { kind: "invalid", error: "Please add your name (or a nickname)." };
  if (message.length < 2) return { kind: "invalid", error: "Please write a short message." };
  if (message.length > MESSAGE_MAX) return { kind: "invalid", error: `Please keep it under ${MESSAGE_MAX} characters.` };
  if (LINK.test(message) || LINK.test(name)) return { kind: "invalid", error: "Links aren't allowed in the guestbook. Please leave them out." };
  return { kind: "ok", name, message };
}
