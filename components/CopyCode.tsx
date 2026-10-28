"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { copyText } from "@/lib/clipboard";

/*
  "Copy" button in the top bar of every code example in my dev notes.
  One click copies the whole example; the button says "Copied!" for two seconds.
  The note page itself stays a server component: only this button runs in the browser.
*/
export default function CopyCode({ code, lang }: { code: string; lang: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const ok = await copyText(code);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  const copied = state === "copied";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy the ${lang} code example`}
      className={`flex items-center gap-1.5 rounded px-2 py-1 font-mono text-[11px] uppercase tracking-widest transition hover:text-teal ${
        copied ? "text-teal" : "text-mist"
      }`}
    >
      <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      {/* role="status" makes screen readers announce the change */}
      <span role="status">{copied ? "Copied!" : state === "failed" ? "Couldn't copy" : "Copy"}</span>
    </button>
  );
}
