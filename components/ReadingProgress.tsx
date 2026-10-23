"use client";

import { useEffect, useRef } from "react";
import { readingProgress } from "@/lib/reading";

/*
  A red-to-teal bar at the very top of a dev note that fills up as you read.
  It measures the note's text only, so it is full when you reach the last
  paragraph (not the footer). Works in every browser, including on iPhones.

  The site-wide scroll bar in app/layout.tsx is hidden on note pages
  (see .reading-progress in app/globals.css), so there are never two bars.
*/
export default function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || !bar.current) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const box = target.getBoundingClientRect();
      const top = box.top + window.scrollY;
      const end = top + box.height - window.innerHeight;
      // 0 at the top of the page, 1 when the last paragraph reaches the bottom of the screen
      const p = readingProgress(window.scrollY, 0, end);
      bar.current!.style.transform = `scaleX(${p})`;
    };
    // Update at most once per screen refresh, so scrolling stays smooth
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="reading-progress pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-line/40">
      <div ref={bar} className="h-full origin-left bg-linear-to-r from-racing to-teal" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
