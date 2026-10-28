"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Icon from "@/components/Icon";
import { btnIcon, btnPrimary } from "@/components/ui";
import { DRAFT_KEY, hasText, readDraft } from "@/lib/contact-draft";

type Status = { state: "idle" | "sending" | "sent" | "error"; text?: string };

const MAX = 3000;

const field =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-ink px-4 py-3 text-snow placeholder:text-mist-dim transition focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

/*
  Contact form: sends to /api/contact, which saves to Supabase with spam checks.
  It also keeps a draft in this tab while the visitor types (see below).
*/
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: stays empty for real people
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const openedAt = useRef(0);
  // Draft: what the visitor typed is kept in this tab (sessionStorage) until they send it
  // or close the tab, so a refresh doesn't lose it (lib/contact-draft.ts)
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    openedAt.current = Date.now();
    try {
      const draft = readDraft(sessionStorage.getItem(DRAFT_KEY));
      if (draft) {
        setName(draft.name);
        setEmail(draft.email);
        setMessage(draft.message);
        openedAt.current = draft.startedAt; // when they first opened the form
        setRestored(true);
      }
    } catch {
      /* storage blocked (private mode in some browsers): just start empty */
    }
    setReady(true);
  }, []);

  // Save the draft half a second after they stop typing
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      try {
        if (hasText({ name, email, message })) {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name, email, message, startedAt: openedAt.current }));
        } else {
          sessionStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        /* storage blocked: the form still works, it just won't remember */
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [ready, name, email, message]);

  function forgetDraft() {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* nothing to remove */
    }
    setRestored(false);
  }

  function startOver() {
    setName("");
    setEmail("");
    setMessage("");
    forgetDraft();
    openedAt.current = Date.now();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ state: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website, elapsedMs: Date.now() - openedAt.current }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setStatus({ state: "error", text: data.error ?? "Something went wrong. Please try again." });
        return;
      }

      setStatus({ state: "sent" });
      setName("");
      setEmail("");
      setMessage("");
      forgetDraft();
    } catch {
      setStatus({ state: "error", text: "You seem to be offline. Please try again." });
    }
  }

  if (status.state === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-teal/40 bg-teal/10 p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 text-teal">
          <Icon name="badge" className="h-7 w-7" />
        </span>
        <p className="mt-4 font-display text-2xl font-black uppercase">Message sent</p>
        <p className="mt-2 text-mist">Thanks for reaching out. I&apos;ll reply to you by email.</p>
        <button
          type="button"
          onClick={() => {
            openedAt.current = Date.now();
            setStatus({ state: "idle" });
          }}
          className="mt-6 font-mono text-xs uppercase tracking-widest text-teal underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status.state === "sending";

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5 rounded-2xl border border-line bg-panel p-6 sm:p-8">
      <div>
        <p className="font-display text-2xl font-black uppercase">Send a message</p>
        <p className="mt-1 text-sm text-mist">All fields are required.</p>
      </div>

      {restored && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-snow">
          <span>I kept what you typed earlier. It stays in this tab until you send it or close the tab.</span>
          <button
            type="button"
            onClick={startOver}
            className="font-mono text-xs uppercase tracking-widest text-teal underline-offset-4 hover:underline"
          >
            Start over
          </button>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-snow">Name</span>
          <input
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-snow">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="flex items-baseline justify-between text-sm font-medium text-snow">
          Message
          <span className="font-mono text-xs font-normal text-mist" aria-live="polite">
            {message.length}/{MAX}
          </span>
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={MAX}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Hi Ammara, I'd like to talk about…"
          className={`${field} resize-y`}
        />
      </label>

      {/* Honeypot: hidden from people and screen readers; bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      {status.state === "error" && (
        <p role="alert" className="rounded-lg border border-racing/50 bg-racing/10 px-4 py-3 text-sm text-snow">
          {status.text}
        </p>
      )}

      <button type="submit" disabled={sending} className={`${btnPrimary} w-full justify-center disabled:opacity-60 sm:w-auto`}>
        {sending ? "Sending…" : "Send message"}
        {!sending && <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />}
      </button>

      <p className="text-xs text-mist">
        Protected against spam by a hidden honeypot field and a rate limit. Your email is only used to reply to you.
      </p>
    </form>
  );
}
