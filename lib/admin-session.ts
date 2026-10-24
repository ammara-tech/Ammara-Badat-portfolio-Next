/*
  Keeps my admin sign-in to ONE browser tab.

  - The sign-in is saved in sessionStorage (not localStorage). Each tab has its
    own sessionStorage and the browser wipes it when the tab or window closes.
    So closing the window signs me out, and a new tab or window, or anyone else
    using this computer, gets the sign-in page.
  - Browsers can bring a closed tab back with its sessionStorage ("Reopen closed
    tab", or "Continue where you left off" after a restart). To stop that, the
    page notes the time when it is closed or left. If it opens again more than
    10 seconds later, it signs out. A normal refresh takes about a second, so
    refreshing keeps me signed in.
*/

export const ADMIN_AUTH_KEY = "portfolio-admin-auth"; // where Supabase keeps the sign-in
export const LEFT_AT_KEY = "portfolio-admin-left-at";
export const REOPEN_LIMIT_MS = 10_000;

/** True when the admin tab was closed or left long enough ago that it must not stay signed in */
export function leftTooLongAgo(leftAt: number | null, now: number, limit = REOPEN_LIMIT_MS) {
  return leftAt !== null && leftAt > 0 && now - leftAt > limit;
}

type TabStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
let store: TabStorage | null = null;

/** sessionStorage, or a temporary in-memory store if the browser blocks it (some private modes) */
export function tabStorage(): TabStorage {
  if (store) return store;
  try {
    const s = window.sessionStorage;
    s.setItem("__test__", "1");
    s.removeItem("__test__");
    store = s;
  } catch {
    const memory = new Map<string, string>();
    store = {
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => void memory.set(k, v),
      removeItem: (k) => void memory.delete(k),
    };
  }
  return store;
}
