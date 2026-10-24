"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getBrowserClient, type ActivityEntry } from "@/lib/supabase";
import { describe, groupActivity, timeAgo } from "@/lib/activity";
import Icon, { type IconName } from "@/components/Icon";

/*
  "Recent activity" timeline on /admin: every project added, edited, published,
  moved to drafts, reordered or deleted.

  The entries are written by a trigger inside Supabase, not by this page
  (Supabase/007-drafts-activity-log.sql), so they can't be faked from a browser.
  Only my account can read them (RLS), and new ones appear live (Realtime).
*/

const icons: Record<ActivityEntry["action"], IconName> = {
  added: "upload",
  edited: "document",
  published: "sparkles",
  unpublished: "pause",
  reordered: "grip",
  deleted: "trash",
};

export default function ActivityLog({ refreshKey = 0 }: { refreshKey?: number }) {
  const supabase = getBrowserClient();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("activity_log")
      .select("id, action, project_id, project_title, details, created_at")
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) {
      setError(
        error.message.includes("activity_log")
          ? "The activity log isn't set up yet. Run Supabase/007-drafts-activity-log.sql in the SQL Editor."
          : error.message,
      );
    } else {
      setError(null);
      setEntries((data ?? []) as ActivityEntry[]);
    }
    setLoading(false);
  }, [supabase]);

  // Reload when the admin page saves something (refreshKey changes)
  useEffect(() => {
    load();
  }, [load, refreshKey]);

  // New entries arrive live
  useEffect(() => {
    const channel = supabase
      .channel("admin-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (payload) => {
        const entry = payload.new as ActivityEntry;
        setEntries((list) => (list.some((e) => e.id === entry.id) ? list : [entry, ...list].slice(0, 40)));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Keep "2 min ago" up to date
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const items = useMemo(() => groupActivity(entries).slice(0, 12), [entries]);

  return (
    <section className="mt-10 rounded-xl border border-line bg-panel p-5" aria-labelledby="activity-title">
      <h2 id="activity-title" className="flex items-center gap-2 text-xl font-semibold">
        <Icon name="chart" className="h-5 w-5 text-teal" />
        Recent activity
      </h2>
      <p className="mt-1 text-sm text-mist">Written by the database itself every time a project changes.</p>

      {error ? (
        <p role="alert" className="mt-4 rounded border border-racing/40 bg-racing/10 p-3 text-sm text-snow">
          {error}
        </p>
      ) : loading ? (
        <p className="mt-4 text-sm text-mist">Loading activity…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-mist">Nothing yet. Add, edit or reorder a project and it shows up here.</p>
      ) : (
        <ol className="relative mt-5 space-y-4 border-l border-line pl-6">
          {items.map((item) => (
            <li key={item.id} className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full border bg-panel ${
                  item.action === "deleted" ? "border-racing/60 text-racing-text" : "border-teal/50 text-teal"
                }`}
              >
                <Icon name={icons[item.action]} className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm text-snow">{describe(item)}</p>
              <time dateTime={item.created_at} className="font-mono text-xs text-mist" title={new Date(item.created_at).toLocaleString("en-ZA")}>
                {timeAgo(item.created_at, now)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
