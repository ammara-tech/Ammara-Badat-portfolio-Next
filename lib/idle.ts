/*
  Auto sign-out for /admin (components/IdleSignOut.tsx).
  After 29 minutes without any clicks, typing or scrolling, a warning appears.
  If nothing happens for one more minute, I'm signed out.
  Tested in tests/admin.test.ts.
*/

export const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const WARNING_MS = 60 * 1000; // warn for the last minute

export type IdleState =
  | { kind: "active" }
  | { kind: "warning"; secondsLeft: number }
  | { kind: "expired" };

/** Where the countdown is, given the time now and the time of my last activity */
export function idleState(now: number, lastActive: number, limit = IDLE_LIMIT_MS, warning = WARNING_MS): IdleState {
  const idle = now - lastActive;
  if (idle >= limit) return { kind: "expired" };
  if (idle >= limit - warning) return { kind: "warning", secondsLeft: Math.ceil((limit - idle) / 1000) };
  return { kind: "active" };
}
