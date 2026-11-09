/*
  The status page (/status): is each of my live sites up right now?
  The server asks each site for its home page, times the answer, and sorts it into up, slow or
  down. Kept apart from the page, with the fetch passed in, so tests/status.test.ts can check it
  without the internet.
*/

export type Health = "up" | "slow" | "down";
export type SiteCheck = { url: string; health: Health; ms: number | null; code: number | null };

/** Slower than this (in milliseconds) counts as slow */
export const SLOW_MS = 3000;
/** Give up after this long */
export const TIMEOUT_MS = 8000;

export function healthOf(ok: boolean, ms: number | null): Health {
  if (!ok || ms === null) return "down";
  return ms > SLOW_MS ? "slow" : "up";
}

type Fetcher = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number }>;

export async function checkSite(url: string, fetcher: Fetcher = fetch, now: () => number = () => performance.now()): Promise<SiteCheck> {
  const start = now();
  try {
    const res = await fetcher(url, { method: "GET", redirect: "follow", cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    const ms = Math.round(now() - start);
    return { url, health: healthOf(res.ok, ms), ms, code: res.status };
  } catch {
    return { url, health: "down", ms: null, code: null };
  }
}

/** "11 of 11 sites are up" */
export function summary(checks: Pick<SiteCheck, "health">[]) {
  const working = checks.filter((c) => c.health !== "down").length;
  if (checks.length === 0) return "No sites to check";
  return working === checks.length
    ? `All ${checks.length} sites are up`
    : `${working} of ${checks.length} sites are up`;
}

/** "ticklist-pi.vercel.app" from "https://ticklist-pi.vercel.app/" */
export function shortUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
