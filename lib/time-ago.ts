/*
  "5 min ago", "2 days ago": short, friendly times for the admin inbox (components/Inbox.tsx)
  and the activity log (components/ActivityLog.tsx). The full date and time is still there
  when you hover over it. Tested in tests/admin.test.ts.
*/

/** How long ago something happened, in words. After a week it shows the date instead. */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  if (hours < 48) return "yesterday";
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const date = new Date(iso);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

/** The full date and time, for the hover text: "2 Nov 2026, 14:05" */
export function fullDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" });
}
