"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { motionReduced } from "@/lib/motion";
import { nextSectionIndex, showMoreBelow } from "@/lib/page-nav";

/*
  A small "More below" button at the bottom of the first screen of a long page, so visitors
  know there's more to see. It never moves the page by itself, and it fades away as soon as
  they start scrolling (lib/page-nav.ts decides when it shows).
  Pressing it jumps to the next section heading and moves keyboard focus there too, so
  keyboard and screen-reader users carry on from the right place.
  On phones it sits above the navigation bar. Not shown in the admin area or when printing.
*/
export default function MoreBelow() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setVisible(showMoreBelow(window.scrollY, document.documentElement.scrollHeight, window.innerHeight));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  function goDown() {
    const behavior = motionReduced() ? "auto" : "smooth";
    const headings = [...document.querySelectorAll<HTMLElement>("#main h2, #main h3[id]")];
    const next = headings[nextSectionIndex(headings.map((h) => h.getBoundingClientRect().top), window.innerHeight)];
    if (!next) {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior });
      return;
    }
    // Leave room for the sticky navigation bar at the top
    window.scrollTo({ top: next.getBoundingClientRect().top + window.scrollY - 96, behavior });
    if (!next.hasAttribute("tabindex")) next.setAttribute("tabindex", "-1");
    next.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={goDown}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-24 left-1/2 z-40 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-line-strong bg-panel-alt px-4 py-2 font-mono text-xs uppercase tracking-widest text-mist shadow-lg transition duration-300 hover:border-teal hover:text-teal focus-visible:text-teal md:bottom-8 print:hidden ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      More below
      <Icon name="chevron-down" className="h-4 w-4" />
    </button>
  );
}
