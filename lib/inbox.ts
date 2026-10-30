import type { Message } from "@/lib/supabase";

/*
  Small helpers for the admin inbox (components/Inbox.tsx).
  Kept here, away from the component, so they can be tested (tests/admin.test.ts).
*/

/** Builds the Reply link: their address, a subject and their message quoted underneath */
export function replyLink(msg: Pick<Message, "name" | "email" | "message">) {
  const firstName = msg.name.trim().split(/\s+/)[0];
  const quoted = msg.message.length > 500 ? `${msg.message.slice(0, 500)}…` : msg.message;
  const body = `Hi ${firstName},\n\nThank you for your message on my portfolio.\n\n\n\nKind regards,\nAmmara\n\n> ${quoted.replace(/\n/g, "\n> ")}`;
  return `mailto:${msg.email}?subject=${encodeURIComponent("Re: your message on my portfolio")}&body=${encodeURIComponent(body)}`;
}

/** True when a message matches the search box (name, email or text, any capitals) */
export function matchesSearch(msg: Pick<Message, "name" | "email" | "message">, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [msg.name, msg.email, msg.message].some((field) => field.toLowerCase().includes(q));
}

/** The unread messages "Mark all read" changes: every unread one, except a message waiting for Undo delete */
export function unreadIds(messages: Pick<Message, "id" | "is_read">[], skipId?: string | null): string[] {
  return messages.filter((m) => !m.is_read && m.id !== skipId).map((m) => m.id);
}
