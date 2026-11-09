"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Icon from "@/components/Icon";
import { btnIcon, btnPrimary } from "@/components/ui";
import { MESSAGE_MAX, NAME_MAX } from "@/lib/guestbook";

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-ink px-4 py-3 text-snow placeholder:text-mist-dim transition focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

type Status = { state: "idle" | "sending" | "sent" | "error"; text?: string };

/*
  The guestbook form: sends to /api/guestbook (spam checks there and in the database).
  Entries wait for my approval, and the form says so, so nobody wonders where theirs went.
*/
export default function GuestbookForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: stays empty for real people
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const openedAt = useRef(0);
  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ state: "sending" });
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, website, elapsedMs: Date.now() - openedAt.current }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) return setStatus({ state: "error", text: data.error ?? "Something went wrong. Please try again." });
      setStatus({ state: "sent" });
      setName("");
      setMessage("");
    } catch {
      setStatus({ state: "error", text: "You seem to be offline. Please try again." });
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-teal/40 bg-teal/10 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 text-teal">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <p className="mt-4 font-display text-2xl font-black uppercase">Thank you!</p>
        <p className="mt-2 text-mist">Your message will appear here once I&apos;ve read it, usually within a day.</p>
      </div>
    );
  }

  const sending = status.state === "sending";
  return (
    <form onSubmit={handleSubmit} className="relative space-y-5 rounded-2xl border border-line bg-panel p-6 sm:p-8">
      <div>
        <p className="font-display text-2xl font-black uppercase">Sign the guestbook</p>
        <p className="mt-1 text-sm text-mist">Say hello, or tell me what you liked. Messages show after I&apos;ve read them, and links aren&apos;t allowed.</p>
      </div>

      {/* Honeypot: hidden from people and screen readers; bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <label className="block text-sm font-semibold text-snow">
        Your name
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={NAME_MAX} autoComplete="name" className={field} placeholder="A nickname is fine" />
      </label>
      <label className="block text-sm font-semibold text-snow">
        Message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={MESSAGE_MAX} rows={3} className={field} />
        <span className="mt-1 block text-right font-mono text-xs font-normal text-mist">
          {message.length}/{MESSAGE_MAX}
        </span>
      </label>

      {status.state === "error" && (
        <p role="alert" className="text-sm font-semibold text-racing-text">
          {status.text}
        </p>
      )}

      <button type="submit" disabled={sending} className={`${btnPrimary} disabled:opacity-60`}>
        {sending ? "Sending…" : "Sign the guestbook"}
        <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
      </button>
    </form>
  );
}
