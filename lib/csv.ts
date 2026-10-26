/*
  Turns contact messages into a CSV file (a spreadsheet file that Excel and Google Sheets open),
  for the "Download CSV" button in the admin inbox (components/Inbox.tsx).
  Tested in tests/admin.test.ts.
*/

/**
 * One spreadsheet cell, made safe:
 * - text with commas, quotes or line breaks is wrapped in quotes, with quotes doubled ("" inside "")
 * - text starting with = + - @ (or a tab or line break) gets a ' in front, so a spreadsheet shows it
 *   as text instead of running it as a formula. Messages come from the public contact form, so
 *   someone could try to send one that looks like a formula ("CSV injection").
 */
export function csvCell(value: string | number | boolean | null | undefined) {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export type CsvMessage = { name: string; email: string; message: string; is_read: boolean; created_at: string };

/** The whole file: a header row, then one row per message (Windows line endings, which Excel prefers) */
export function messagesCsv(messages: CsvMessage[]) {
  const header = ["Sent", "Name", "Email", "Message", "Read"];
  const rows = messages.map((m) => [
    new Date(m.created_at).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }),
    m.name,
    m.email,
    m.message,
    m.is_read ? "Yes" : "No",
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

/** "messages-2026-10-26.csv" */
export function csvFileName(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `messages-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;
}
