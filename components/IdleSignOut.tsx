"use client";

import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase";
import { idleState, IDLE_LIMIT_MS, type IdleState } from "@/lib/idle";

/*
  Signs me out of /admin after 30 minutes without activity, in case I leave
  a laptop open. A warning with a countdown shows for the last minute.

  My last activity is also saved in localStorage, so two admin tabs share it:
  working in one tab keeps the other one signed in too.
*/

const KEY = "admin-last-active";
export const IDLE_FLAG = "admin-idle-signout"; // tells the sign-in page why I was signed out

function readShared() {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export default function IdleSignOut() {
  const lastActive = useRef(0);
  const lastSaved = useRef(0);
  const [state, setState] = useState<IdleState>({ kind: "active" });
  const stayButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lastActive.current = Date.now();

    const mark = () => {
      const now = Date.now();
      lastActive.current = now;
      // Saving on every mouse move is wasteful, so save at most every 5 seconds
      if (now - lastSaved.current > 5000) {
        lastSaved.current = now;
        try {
          localStorage.setItem(KEY, String(now));
        } catch {
          // private mode: this tab still works on its own
        }
      }
    };
    mark();

    const events = ["pointerdown", "pointermove", "keydown", "scroll", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    async function signOut() {
      try {
        sessionStorage.setItem(IDLE_FLAG, "1");
      } catch {
        // the sign-in page just won't explain why
      }
      await getBrowserClient().auth.signOut();
    }

    // Check once a second. If the laptop was asleep, the first check after waking signs out.
    const timer = setInterval(() => {
      const latest = Math.max(lastActive.current, readShared());
      const next = idleState(Date.now(), latest);
      // Only re-draw when something visible changes
      setState((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      if (next.kind === "expired") {
        clearInterval(timer);
        signOut();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, mark));
    };
  }, []);

  const warning = state.kind === "warning";

  useEffect(() => {
    if (warning) stayButton.current?.focus();
  }, [warning]);

  if (state.kind !== "warning") return null;

  return (
    <div
      role="alertdialog"
      aria-labelledby="idle-title"
      aria-describedby="idle-text"
      className="fixed inset-x-4 bottom-24 z-[70] mx-auto max-w-md rounded-xl border border-racing/60 bg-panel-alt p-5 shadow-2xl md:bottom-8"
    >
      <p id="idle-title" className="font-semibold text-snow">
        Still there?
      </p>
      <p id="idle-text" className="mt-1 text-sm text-mist">
        For safety you&apos;ll be signed out in{" "}
        <span className="font-mono font-bold text-racing-text">{state.secondsLeft}s</span>, after{" "}
        {IDLE_LIMIT_MS / 60000} minutes without activity.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          ref={stayButton}
          type="button"
          onClick={() => setState({ kind: "active" })}
          className="rounded bg-racing px-4 py-2 text-sm font-medium text-white"
        >
          Stay signed in
        </button>
        <button
          type="button"
          onClick={() => getBrowserClient().auth.signOut()}
          className="rounded border border-line-strong px-4 py-2 text-sm"
        >
          Sign out now
        </button>
      </div>
    </div>
  );
}
