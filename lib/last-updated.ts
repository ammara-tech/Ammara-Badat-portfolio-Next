/*
  "Last updated" in the footer: when the live site was last deployed, which is straight after
  my last push, plus a link to that change on GitHub.
  next.config.ts saves the time once, while Vercel builds the site, so it doesn't change when a
  page is refreshed later, and I never have to edit it by hand.
  Tested in tests/content.test.ts.
*/

const REPO = "https://github.com/ammara-tech/Ammara-Badat-portfolio-Next";

/** "4 Nov 2026", in South African time, so a late-night deploy shows the right day */
export function lastUpdatedLabel(iso: string | undefined) {
  if (!iso || Number.isNaN(Date.parse(iso))) return null;
  const parts = new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  // Built from the parts, because some systems write the day as "04"
  return `${Number(part("day"))} ${part("month")} ${part("year")}`;
}

/** The change on GitHub this deploy was built from (Vercel gives the commit ID), or the commit list */
export function lastChangeUrl(commit: string | undefined) {
  return commit && /^[0-9a-f]{7,40}$/i.test(commit) ? `${REPO}/commit/${commit}` : `${REPO}/commits/main`;
}
