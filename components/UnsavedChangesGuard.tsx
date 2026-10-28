"use client";

import { useEffect } from "react";
import { leavesPage } from "@/lib/unsaved";

/*
  Warns me before I lose typing in the admin project form.
  - Closing the tab, refreshing or typing a new address: the browser's own
    "Leave site?" box (the beforeunload event; browsers choose the wording).
  - Clicking a link on my own site (the navbar, the logo...): a "Discard your
    changes?" box, because moving between pages in Next.js doesn't reload the page,
    so the browser's box wouldn't appear.
  It only listens while there are unsaved changes. It draws nothing on the page.
*/

export const DISCARD_MESSAGE = "You have unsaved changes to this project. Leave without saving?";

export default function UnsavedChangesGuard({ dirty }: { dirty: boolean }) {
  useEffect(() => {
    if (!dirty) return;

    function beforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = ""; // older browsers need this to show the box
    }

    function onClick(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("a");
      if (!link || e.defaultPrevented || e.button !== 0) return;
      const modifier = e.ctrlKey || e.metaKey || e.shiftKey || e.altKey;
      const leaving = leavesPage(
        { href: link.href, target: link.target, download: link.hasAttribute("download") },
        window.location.href,
        modifier,
      );
      if (leaving && !window.confirm(DISCARD_MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.addEventListener("beforeunload", beforeUnload);
    // "capture" runs this before Next.js handles the link click
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  return null;
}
