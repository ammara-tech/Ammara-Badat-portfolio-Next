/*
  The contact form's checks, kept separate from the API route
  (app/api/contact/route.ts) so they can be tested on their own (tests/contact.test.ts).
*/

/** Real people take longer than this to fill in the form */
export const MIN_FILL_MS = 3000;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type ContactCheck =
  | { kind: "bot" } // honeypot filled in, or sent too fast: quietly ignored
  | { kind: "invalid"; error: string } // a real person made a mistake: show them why
  | { kind: "ok"; name: string; email: string; message: string };

export function checkContact(body: Record<string, unknown>): ContactCheck {
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const honeypot = String(body.website ?? "");
  const elapsed = Number(body.elapsedMs ?? 0);

  // Spam layers 1 and 2: the hidden field, and filled in too fast
  if (honeypot !== "" || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return { kind: "bot" };

  // The same rules as the database, so people get a friendly message
  if (name.length < 1 || name.length > 100) return { kind: "invalid", error: "Please enter your name." };
  if (!EMAIL.test(email) || email.length > 200) return { kind: "invalid", error: "Please enter a valid email address." };
  if (message.length < 10) return { kind: "invalid", error: "Your message needs at least 10 characters." };
  if (message.length > 3000) return { kind: "invalid", error: "Your message is too long (3000 characters max)." };

  return { kind: "ok", name, email, message };
}
