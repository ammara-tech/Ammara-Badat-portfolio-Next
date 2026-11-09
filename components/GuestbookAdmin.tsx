"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { getBrowserClient } from "@/lib/supabase";
import { fullDate } from "@/lib/time-ago";
import type { GuestbookEntry } from "@/lib/guestbook";

/*
  Guestbook moderation in /admin: every entry, waiting ones first. Approve shows an entry on
  /guestbook, Hide takes it off again, and Delete removes it (pressed twice, so it can't happen
  by accident). Only my account with two-step can do any of this: the database checks it
  (Supabase/011-guestbook.sql), whatever this page sends.
*/
export default function GuestbookAdmin() {
  const supabase = getBrowserClient();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("guestbook")
      .select("id, name, message, approved, created_at")
      .order("approved", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setError("The guestbook couldn't be loaded. Has Supabase/011-guestbook.sql been run?");
    else {
      setError(null);
      setEntries((data ?? []) as GuestbookEntry[]);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function setApproved(entry: GuestbookEntry, approved: boolean) {
    setEntries((list) => list.map((e) => (e.id === entry.id ? { ...e, approved } : e)));
    const { error } = await supabase.from("guestbook").update({ approved }).eq("id", entry.id);
    if (error) {
      setError("That change couldn't be saved.");
      load();
    }
  }

  async function remove(entry: GuestbookEntry) {
    if (confirming !== entry.id) return setConfirming(entry.id);
    setConfirming(null);
    setEntries((list) => list.filter((e) => e.id !== entry.id));
    const { error } = await supabase.from("guestbook").delete().eq("id", entry.id);
    if (error) {
      setError("That entry couldn't be deleted.");
      load();
    }
  }

  const waiting = entries.filter((e) => !e.approved).length;
  return (
    <section className="mt-8 rounded-xl border border-line bg-panel p-5" aria-labelledby="guestbook-admin">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="guestbook-admin" className="text-xl font-semibold">
          Guestbook
        </h2>
        {waiting > 0 && <span className="rounded-full bg-racing px-2 py-0.5 font-mono text-xs font-bold text-white">{waiting} waiting</span>}
        <Link href="/guestbook" target="_blank" className="ml-auto font-mono text-xs uppercase tracking-widest text-teal hover:underline">
          Open the guestbook
        </Link>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-racing-text">
          {error}
        </p>
      )}
      {entries.length === 0 && !error ? (
        <p className="mt-3 text-sm text-mist">No entries yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map((e) => (
            <li key={e.id} className={`rounded-lg border p-4 ${e.approved ? "border-line" : "border-racing/50"}`}>
              <p className="whitespace-pre-line text-snow">{e.message}</p>
              <p className="mt-2 font-mono text-xs text-mist">
                {e.name} · {fullDate(e.created_at)} · {e.approved ? "Shown on the site" : "Waiting"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setApproved(e, !e.approved)}
                  className="inline-flex items-center gap-1.5 rounded border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:border-teal hover:text-teal"
                >
                  <Icon name={e.approved ? "close" : "check"} className="h-3.5 w-3.5" />
                  {e.approved ? "Hide" : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(e)}
                  className="inline-flex items-center gap-1.5 rounded border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-racing-text hover:border-racing"
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                  {confirming === e.id ? "Press again to delete" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
