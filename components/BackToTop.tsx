"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { motionReduced } from "@/lib/motion";
import { showBackToTop } from "@/lib/back-to-top";

/*
  A small "back to top" arrow that appears after scrolling down a long page.
  On phones it sits above the navigation bar at the bottom.
  It isn't shown on the admin page, where the inbox pop-ups use the same corner.
  After jumping up, focus moves to the top of the page content, so keyboard and
  screen-reader users continue from there too.
*/
export default function BackToTop() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      setVisible(showBackToTop(window.scrollY, window.innerHeight));
    };
    // At most one check per screen refresh, so scrolling stays smooth
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

  function goUp() {
    window.scrollTo({ top: 0, behavior: motionReduced() ? "auto" : "smooth" });
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      onClick={goUp}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-24 right-4 z-40 rounded-full border border-line-strong bg-panel-alt p-3 text-mist shadow-lg transition duration-300 hover:border-teal hover:text-teal md:bottom-8 md:right-8 print:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <Icon name="chevron-up" className="h-5 w-5" />
    </button>
  );
}
