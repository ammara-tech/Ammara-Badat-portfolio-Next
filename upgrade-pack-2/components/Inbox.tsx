"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClient, type Message } from "@/lib/supabase";
import Icon from "@/components/Icon";

/*
  Contact form inbox for /admin. Reading only works for my account,
  because of the "Owner can read messages" RLS policy.
*/

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
}

/** onChange lets the admin overview cards refresh when a message is read or deleted */
export default function Inbox({ onChange }: { onChange?: () => void }) {
  const supabase = getBrowserClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("id, name, email, message, is_read, created_at")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setMessages((data ?? []) as Message[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function setRead(msg: Message, isRead: boolean) {
    const { error } = await supabase.from("messages").update({ is_read: isRead }).eq("id", msg.id);
    if (error) setError(error.message);
    else {
      setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, is_read: isRead } : m)));
      onChange?.();
    }
  }

  async function open(msg: Message) {
    const next = openId === msg.id ? null : msg.id;
    setOpenId(next);
    if (next && !msg.is_read) await setRead(msg, true);
  }

  async function remove(msg: Message) {
    if (!window.confirm(`Delete the message from ${msg.name}?`)) return;
    const { error } = await supabase.from("messages").delete().eq("id", msg.id);
    if (error) setError(error.message);
    else {
      setMessages((list) => list.filter((m) => m.id !== msg.id));
      onChange?.();
    }
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <section className="mt-10 rounded-xl border border-line bg-panel p-5" aria-labelledby="inbox-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="inbox-title" className="flex items-center gap-2 text-xl font-semibold">
          <Icon name="inbox" className="h-5 w-5 text-teal" />
          Messages
          {unread > 0 && (
            <span className="rounded-full bg-racing px-2 py-0.5 font-mono text-xs text-white">{unread} new</span>
          )}
        </h2>
        <button
          onClick={() => {
            load();
            onChange?.();
          }}
          className="rounded border border-line-strong px-3 py-1 text-sm hover:border-teal hover:text-teal">
          Refresh
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded border border-racing/40 bg-racing/10 p-3 text-sm text-snow">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-mist">Loading messages…</p>
      ) : messages.length === 0 ? (
        <p className="mt-4 text-sm text-mist">No messages yet. Messages sent from the Contact page appear here.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {messages.map((msg) => (
            <li key={msg.id} className="py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  onClick={() => open(msg)}
                  aria-expanded={openId === msg.id}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex items-center gap-2">
                    {!msg.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-teal" aria-label="Unread" />}
                    <span className={msg.is_read ? "text-mist" : "font-semibold text-snow"}>{msg.name}</span>
                    <span className="truncate text-sm text-mist">{msg.email}</span>
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-mist">{formatDate(msg.created_at)}</span>
                  {openId !== msg.id && <span className="mt-1 block truncate text-sm text-mist">{msg.message}</span>}
                </button>

                <div className="flex gap-2">
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent("Re: your message on my portfolio")}`}
                    className="rounded border border-line-strong px-3 py-1 text-sm hover:border-teal hover:text-teal"
                  >
                    Reply
                  </a>
                  <button
                    onClick={() => setRead(msg, !msg.is_read)}
                    className="rounded border border-line-strong px-3 py-1 text-sm hover:border-teal hover:text-teal"
                  >
                    Mark {msg.is_read ? "unread" : "read"}
                  </button>
                  <button
                    onClick={() => remove(msg)}
                    aria-label={`Delete message from ${msg.name}`}
                    className="rounded border border-racing/50 px-2 py-1 text-racing-text hover:bg-racing/10"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {openId === msg.id && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-ink p-4 text-sm leading-relaxed text-snow">
                  {msg.message}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
