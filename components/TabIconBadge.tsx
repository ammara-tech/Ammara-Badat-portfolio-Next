"use client";

import { useEffect, useRef } from "react";
import { addBadge } from "@/lib/tab-badge";

/*
  Shows the number of unread messages on the browser tab's icon in /admin,
  so I can see them even when the tab is too narrow to show its title.
  It draws nothing on the page itself.

  How: it reads my site icon (/icon.svg is plain SVG text), adds a badge
  (lib/tab-badge.ts) and points the tab icon at the new picture. With no
  unread messages, or when I leave /admin, the normal icon comes back.
  Browsers that don't use SVG tab icons simply keep the normal one.
*/

export default function TabIconBadge({ count }: { count: number }) {
  const original = useRef<string | null>(null);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"][type="image/svg+xml"]');
    if (!link) return;
    if (original.current === null) original.current = link.href;
    const plain = original.current;

    if (count <= 0) {
      link.href = plain;
      return;
    }

    let cancelled = false;
    fetch(plain)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error("icon not found"))))
      .then((svg) => {
        if (!cancelled) link.href = `data:image/svg+xml,${encodeURIComponent(addBadge(svg, count))}`;
      })
      .catch(() => {
        /* keep the normal icon */
      });
    return () => {
      cancelled = true;
    };
  }, [count]);

  // Put the normal icon back when leaving /admin
  useEffect(
    () => () => {
      const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"][type="image/svg+xml"]');
      if (link && original.current) link.href = original.current;
    },
    [],
  );

  return null;
}
