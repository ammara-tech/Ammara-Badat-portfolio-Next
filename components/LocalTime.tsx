"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { localTimeLine } from "@/lib/local-time";

/*
  My local time on the Contact page, updated every 30 seconds.
  It's only worked out in the browser (after the page loads), because the server
  doesn't know the visitor's time zone, and the time on a cached page would be old.
  Until then the line keeps its space, so nothing jumps.
*/
export default function LocalTime() {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const tick = () => setLine(localTimeLine(new Date(), zone));
    tick();
    const timer = setInterval(tick, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="flex min-h-5 items-start gap-2 font-mono text-xs uppercase leading-5 tracking-widest text-mist">
      <Icon name="clock" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{line ?? "\u00a0"}</span>
    </p>
  );
}
