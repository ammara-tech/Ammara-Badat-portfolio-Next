"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

/*
  "Copy" button inside the email card on the Contact page.
  One tap copies my address, the icon turns into a tick and "Copied!" shows
  for two seconds. Handy for recruiters who use webmail (like Gmail in a browser),
  where a mailto: link doesn't open anything.
  It sits on top of the card (not inside the link), because a button inside a link isn't allowed in HTML.
*/
export default function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      // Older browsers or no permission: copy from a hidden text box instead
      const box = document.createElement("textarea");
      box.value = email;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      box.remove();
    }
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  const copied = state === "copied";

  return (
    <div className="absolute inset-y-0 right-4 flex items-center">
      {/* Read out by screen readers, and shown as a small label next to the button */}
      <span role="status" className="pointer-events-none absolute right-full mr-2 whitespace-nowrap">
        {state !== "idle" && (
          <span className="block rounded-md border border-teal/50 bg-panel-alt px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-snow shadow-lg">
            {copied ? "Copied!" : "Couldn't copy"}
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy my email address, ${email}`}
        title="Copy email"
        className={`rounded-lg border p-2.5 transition hover:border-teal hover:text-teal ${
          copied ? "border-teal text-teal" : "border-line-strong text-mist"
        }`}
      >
        <Icon name={copied ? "check" : "copy"} className="h-5 w-5" />
      </button>
    </div>
  );
}
