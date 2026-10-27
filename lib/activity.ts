import type { ActivityEntry } from "@/lib/supabase";

/*
  Helpers for the activity log on /admin (components/ActivityLog.tsx).
  The log itself is written by triggers inside Supabase: projects in
  Supabase/007-drafts-activity-log.sql, messages and images in
  Supabase/009-activity-log-messages-images.sql. Tested in tests/admin.test.ts.
*/

/** One line of the timeline, after reorders made together have been grouped */
export type TimelineItem = ActivityEntry & { count: number };

export type ActivityKind = NonNullable<ActivityEntry["kind"]>;

/** Old rows (before the kind column existed) are all about projects */
export function kindOf(entry: Pick<ActivityEntry, "kind">): ActivityKind {
  return entry.kind ?? "project";
}

/** Keeps only one kind of entry ("all" keeps everything) */
export function filterActivity<T extends Pick<ActivityEntry, "kind">>(entries: T[], kind: ActivityKind | "all"): T[] {
  return kind === "all" ? entries : entries.filter((e) => kindOf(e) === kind);
}

/** How many entries there are of each kind, for the numbers on the filter buttons */
export function countByKind(entries: Pick<ActivityEntry, "kind">[]): Record<ActivityKind | "all", number> {
  const counts = { all: entries.length, project: 0, message: 0, image: 0 };
  for (const e of entries) counts[kindOf(e)] += 1;
  return counts;
}

/** Turns a log entry into a short sentence, e.g. "Edited MyFlix (summary, tags)" */
export function describe(item: Pick<TimelineItem, "kind" | "action" | "project_title" | "details" | "count">) {
  const t = item.project_title;
  const kind = kindOf(item);
  if (kind === "message") {
    return item.action === "received" ? `New message from ${t}` : `Deleted the message from ${t}`;
  }
  if (kind === "image") {
    return item.action === "uploaded" ? `Uploaded the image ${t}` : `Deleted the image ${t}`;
  }
  switch (item.action) {
    case "added":
      return `Added ${t}${item.details ? ` ${item.details}` : ""}`;
    case "edited":
      return `Edited ${t}${item.details ? ` (${item.details})` : ""}`;
    case "published":
      return `Published ${t}`;
    case "unpublished":
      return `Moved ${t} to drafts`;
    case "deleted":
      return `Deleted ${t}`;
    case "reordered":
      return item.count > 1 ? `Changed the project order (${item.count} projects moved)` : `Moved ${t} ${item.details ?? ""}`.trim();
    default:
      return `${t}: ${item.action}`;
  }
}

/**
 * Dragging one project can change the position of several others, which writes one
 * log entry per project. Entries made within a few seconds of each other are shown
 * as a single "Changed the project order" line. The list is newest first.
 */
export function groupActivity(entries: ActivityEntry[], withinMs = 10_000): TimelineItem[] {
  const out: TimelineItem[] = [];
  for (const entry of entries) {
    const last = out[out.length - 1];
    if (
      last &&
      last.action === "reordered" &&
      entry.action === "reordered" &&
      Math.abs(Date.parse(last.created_at) - Date.parse(entry.created_at)) <= withinMs
    ) {
      last.count += 1;
      continue;
    }
    out.push({ ...entry, count: 1 });
  }
  return out;
}

/** "just now", "5 min ago", "3 h ago", "yesterday", or a date like "21 Oct" */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return "yesterday";
  return new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}
