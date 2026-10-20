"use client";

import { useEffect, useState } from "react";
import { getBrowserClient, type Project } from "@/lib/supabase";
import Icon, { type IconName } from "@/components/Icon";

/*
  Overview cards at the top of /admin: projects, unread messages and
  messages in the last 7 days (with a small bar chart, one bar per day).
  The messages can only be read by my account, because of RLS.
*/

type MessageRow = { created_at: string; is_read: boolean };

const DAY = 24 * 60 * 60 * 1000;

function lastSevenDays(rows: MessageRow[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const start = new Date(today.getTime() - (6 - i) * DAY);
    const end = start.getTime() + DAY;
    const count = rows.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= start.getTime() && t < end;
    }).length;
    return { label: start.toLocaleDateString("en-ZA", { weekday: "short" }), date: start, count };
  });
}

export default function AdminOverview({ projects, refreshKey }: { projects: Project[]; refreshKey: number }) {
  const [rows, setRows] = useState<MessageRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await getBrowserClient().from("messages").select("created_at, is_read");
      if (cancelled) return;
      if (error) setError(error.message);
      else setRows((data ?? []) as MessageRow[]);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const unread = rows?.filter((r) => !r.is_read).length;
  const days = lastSevenDays(rows ?? []);
  const week = days.reduce((n, d) => n + d.count, 0);
  const peak = Math.max(1, ...days.map((d) => d.count));
  const withImage = projects.filter((p) => p.image_url).length;
  const tagCount = new Set(projects.flatMap((p) => p.tags)).size;

  const show = (n: number | undefined) => (n === undefined ? "–" : String(n));

  return (
    <section aria-labelledby="overview-title" className="mt-8">
      <h2 id="overview-title" className="flex items-center gap-2 text-xl font-semibold">
        <Icon name="chart" className="h-5 w-5 text-teal" />
        Overview
      </h2>

      {error && (
        <p role="alert" className="mt-3 rounded border border-racing/40 bg-racing/10 p-3 text-sm text-snow">
          Couldn&apos;t load message stats. ({error})
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="cube" label="Projects" value={String(projects.length)} note={`${withImage} with a screenshot · ${tagCount} tags`} />
        <StatCard
          icon="inbox"
          label="Unread messages"
          value={show(unread)}
          note={rows ? `${rows.length} messages in total` : "Loading…"}
          highlight={Boolean(unread)}
        />
        <StatCard icon="mail" label="Messages this week" value={show(rows ? week : undefined)} note="The last 7 days, today included" />

        {/* 7-day bar chart */}
        <div className="spotlight rounded-xl border border-line bg-panel p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-mist">Last 7 days</p>
          <ul className="mt-3 flex h-20 items-end gap-1.5" aria-label="Messages per day for the last 7 days">
            {days.map((d) => (
              <li key={d.date.toISOString()} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="sr-only">
                  {d.label}: {d.count} {d.count === 1 ? "message" : "messages"}
                </span>
                <span
                  aria-hidden="true"
                  title={`${d.count} on ${d.date.toLocaleDateString("en-ZA")}`}
                  className={`w-full rounded-sm transition-all duration-700 ${d.count ? "bg-linear-to-t from-racing to-teal" : "bg-line-strong"}`}
                  style={{ height: `${Math.max(6, (d.count / peak) * 100)}%` }}
                />
                <span aria-hidden="true" className="font-mono text-[10px] uppercase text-mist">
                  {d.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  highlight = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div className={`spotlight rounded-xl border bg-panel p-5 ${highlight ? "spotlight-red border-racing/50" : "border-line"}`}>
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-mist">
        <Icon name={icon} className="h-4 w-4 text-teal" />
        {label}
      </p>
      <p className="mt-2 font-display text-4xl font-black text-snow">{value}</p>
      <p className="mt-1 text-sm text-mist">{note}</p>
    </div>
  );
}
