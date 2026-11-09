"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { readingProgress } from "@/lib/reading";
import { hasPageProgress, isLongPage } from "@/lib/page-nav";

/*
  A thin red-to-teal bar at the very top of long pages that fills up as you scroll, on a faint
  track, so visitors can see how much of the page is left. It works in every browser, including
  on iPhones. Dev notes have their own bar that measures just the note (ReadingProgress.tsx),
  so this one isn't shown there, and it only appears on pages more than two screens tall
  (lib/page-nav.ts). It's information, not an animation, so it stays when animations are off.
*/
export default function PageProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const [long, setLong] = useState(false);
  const enabled = hasPageProgress(pathname);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight;
      setLong(isLongPage(height, window.innerHeight));
      if (bar.current) bar.current.style.transform = `scaleX(${readingProgress(window.scrollY, 0, height - window.innerHeight)})`;
    };
    const onChange = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("resize", onChange);
    // Pictures and live data can make the page longer after it loads
    const watcher = new ResizeObserver(onChange);
    watcher.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", onChange);
      watcher.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname, enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden="true" className={`pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-line/40 print:hidden ${long ? "" : "hidden"}`}>
      <div ref={bar} className="h-full origin-left bg-linear-to-r from-racing to-teal" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
