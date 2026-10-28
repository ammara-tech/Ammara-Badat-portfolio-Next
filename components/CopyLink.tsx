"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { copyText } from "@/lib/clipboard";
import { btnGhost } from "@/components/ui";

/*
  "Copy link" button on project pages and the case study, for sharing a project
  on LinkedIn, WhatsApp or in an email. It copies the page's clean address
  (no ?tag= or #heading on the end), and says "Link copied!" for two seconds.
*/
export default function CopyLink({ url, label }: { url: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const ok = await copyText(url);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  const copied = state === "copied";

  return (
    <button type="button" onClick={copy} aria-label={`Copy the link to ${label}`} className={`${btnGhost} ${copied ? "border-teal text-teal" : ""}`}>
      <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
      {/* role="status" makes screen readers announce the change */}
      <span role="status">{copied ? "Link copied!" : state === "failed" ? "Couldn't copy" : "Copy link"}</span>
    </button>
  );
}
