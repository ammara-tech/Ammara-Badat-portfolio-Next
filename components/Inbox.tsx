"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBrowserClient, type Message } from "@/lib/supabase";
import Icon from "@/components/Icon";
import TabIconBadge from "@/components/TabIconBadge";
import { matchesSearch, replyLink } from "@/lib/inbox";
import { csvFileName, messagesCsv } from "@/lib/csv";

/*
  Contact form inbox for /admin. Reading only works for my account,
  because of the "Owner can read messages" RLS policy.

  - Live: new messages appear without refreshing (Supabase Realtime,
    switched on by Supabase/006-realtime-inbox.sql). Realtime follows the
    same RLS rules, so only my account is sent the messages.
  - The browser tab shows how many are unread, e.g. "(2) Admin — Ammara Badat",
    and the tab icon gets a number badge (components/TabIconBadge.tsx).
  - Search and All / Unread / Read filters.
  - Reply opens my email app with the sender, a subject and their message quoted.
  - Delete waits 5 seconds so I can press Undo.
  - Download CSV saves the messages I'm looking at (after search and filters) as a spreadsheet file.
*/

const TAB_TITLE = "Admin — Ammara Badat";
const UNDO_MS = 5000;

type Filter = "all" | "unread" | "read";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
}

/** onChange lets the admin overview cards refresh when a message arrives, is read or is deleted */
export default function Inbox({ onChange }: { onChange?: () => void }) {
  const supabase = getBrowserClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState<Message | null>(null); // deleted, but can still be undone

  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const deleteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingRef = useRef<Message | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

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

  function showToast(text: string) {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  }

  // ---------- Live updates from Supabase Realtime ----------
  useEffect(() => {
    const channel = supabase
      .channel("admin-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const msg = payload.new as Message;
          setMessages((list) => (list.some((m) => m.id === msg.id) ? list : [msg, ...list]));
          showToast(`New message from ${msg.name}`);
        } else if (payload.eventType === "UPDATE") {
          const msg = payload.new as Message;
          setMessages((list) => list.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
        } else if (payload.eventType === "DELETE") {
          const id = (payload.old as { id?: string }).id;
          setMessages((list) => list.filter((m) => m.id !== id));
        }
        onChangeRef.current?.();
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // ---------- Unread count in the browser tab ----------
  const unread = messages.filter((m) => !m.is_read && m.id !== pending?.id).length;

  useEffect(() => {
    document.title = unread > 0 ? `(${unread}) ${TAB_TITLE}` : TAB_TITLE;
  }, [unread]);

  useEffect(() => () => void (document.title = TAB_TITLE), []);

  // ---------- Read / unread ----------
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

  // ---------- Delete with Undo ----------
  const commitDelete = useCallback(
    async (msg: Message) => {
      clearTimeout(deleteTimer.current);
      pendingRef.current = null;
      setPending(null);
      const { data, error } = await supabase.from("messages").delete().eq("id", msg.id).select("id");
      if (error || !data || data.length === 0) {
        setError(error?.message ?? "The message wasn't deleted. You may not have permission.");
        return; // it stays in the list, because it was never removed from it
      }
      setMessages((list) => list.filter((m) => m.id !== msg.id));
      onChangeRef.current?.();
    },
    [supabase],
  );

  function remove(msg: Message) {
    // Only one Undo at a time: finish any earlier delete first
    if (pendingRef.current) commitDelete(pendingRef.current);
    pendingRef.current = msg;
    setPending(msg);
    if (openId === msg.id) setOpenId(null);
    deleteTimer.current = setTimeout(() => commitDelete(msg), UNDO_MS);
  }

  function undo() {
    clearTimeout(deleteTimer.current);
    pendingRef.current = null;
    setPending(null);
  }

  // Leaving the admin page finishes a delete that is waiting for Undo
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      if (pendingRef.current) {
        clearTimeout(deleteTimer.current);
        supabase.from("messages").delete().eq("id", pendingRef.current.id).then(() => {});
      }
    },
    [supabase],
  );

  // ---------- Search and filters ----------
  const visible = useMemo(
    () =>
      messages.filter(
        (m) =>
          m.id !== pending?.id &&
          (filter === "all" || (filter === "unread" ? !m.is_read : m.is_read)) &&
          matchesSearch(m, query),
      ),
    [messages, pending, filter, query],
  );

  // Builds the CSV in the browser and downloads it. Nothing is sent anywhere.
  function downloadCsv() {
    const csv = "\uFEFF" + messagesCsv(visible); // the BOM at the start makes Excel read accents and emoji correctly
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = csvFileName();
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${visible.length} ${visible.length === 1 ? "message" : "messages"}`);
  }

  const counts = {
    all: messages.filter((m) => m.id !== pending?.id).length,
    unread,
    read: messages.filter((m) => m.is_read && m.id !== pending?.id).length,
  };

  return (
    <section className="mt-10 rounded-xl border border-line bg-panel p-5" aria-labelledby="inbox-title">
      <TabIconBadge count={unread} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="inbox-title" className="flex items-center gap-2 text-xl font-semibold">
          <Icon name="inbox" className="h-5 w-5 text-teal" />
          Messages
          {unread > 0 && (
            <span className="rounded-full bg-racing px-2 py-0.5 font-mono text-xs text-white">{unread} new</span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={`flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest ${live ? "text-teal" : "text-mist"}`}
            title={live ? "New messages appear here straight away" : "Connecting to live updates…"}
          >
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${live ? "bg-teal fx-live" : "bg-line-strong"}`} />
            {live ? "Live" : "Connecting"}
          </span>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={visible.length === 0}
            title="Download the messages shown below as a spreadsheet (CSV)"
            className="flex items-center gap-1.5 rounded border border-line-strong px-3 py-1 text-sm hover:border-teal hover:text-teal disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-snow"
          >
            <Icon name="download" className="h-4 w-4" />
            CSV
            <span className="sr-only">: download the {visible.length} messages shown</span>
          </button>
          <button
            onClick={() => {
              load();
              onChange?.();
            }}
            className="rounded border border-line-strong px-3 py-1 text-sm hover:border-teal hover:text-teal"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search messages</span>
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or message"
            className="w-full rounded border border-line-strong bg-ink py-2 pl-9 pr-3 text-sm text-snow focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
          />
        </label>
        <div role="group" aria-label="Show messages" className="flex rounded border border-line-strong p-0.5">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`flex-1 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm capitalize transition ${
                filter === f ? "bg-teal/15 text-teal" : "text-mist hover:text-snow"
              }`}
            >
              {f} <span className="font-mono text-xs opacity-80">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded border border-racing/40 bg-racing/10 p-3 text-sm text-snow">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-mist">Loading messages…</p>
      ) : counts.all === 0 ? (
        <p className="mt-4 text-sm text-mist">No messages yet. Messages sent from the Contact page appear here straight away.</p>
      ) : visible.length === 0 ? (
        <p className="mt-4 text-sm text-mist">
          No {filter === "all" ? "" : `${filter} `}messages{query.trim() ? ` match "${query.trim()}"` : ""}.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {visible.map((msg) => (
            <li key={msg.id} className="py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  onClick={() => open(msg)}
                  aria-expanded={openId === msg.id}
                  className="min-w-0 flex-1 basis-56 text-left"
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
                    href={replyLink(msg)}
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

      {/* Pop-ups: Undo for a delete, and "New message" from Realtime. Above the phone navigation bar. */}
      <div className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-end gap-2 md:inset-x-auto md:bottom-6 md:right-6">
        <div role="status" aria-live="polite" className="contents">
          {pending && (
            <div className="pointer-events-auto flex w-full items-center justify-between gap-4 rounded-lg border border-line-strong bg-panel-alt px-4 py-3 text-sm text-snow shadow-2xl md:w-auto">
              <span>Message from {pending.name} deleted</span>
              <button onClick={undo} className="font-mono text-xs font-bold uppercase tracking-widest text-teal hover:underline">
                Undo
              </button>
            </div>
          )}
          {toast && (
            <div className="pointer-events-auto flex w-full items-center gap-3 rounded-lg border border-teal/50 bg-panel-alt px-4 py-3 text-sm text-snow shadow-2xl md:w-auto">
              <Icon name="inbox" className="h-4 w-4 text-teal" />
              <span>{toast}</span>
              <button onClick={() => setToast(null)} aria-label="Close" className="ml-auto text-mist hover:text-snow">
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
