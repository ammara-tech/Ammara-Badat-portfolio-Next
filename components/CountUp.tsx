"use client";

import { useEffect, useRef, useState } from "react";
import { motionReduced } from "@/lib/motion";
import { splitCount } from "@/lib/count-up";

/**
 * Counts a number up from 0 when it scrolls into view, e.g. "10+" or "7".
 * Years (4 digits) and text without a number are shown as they are.
 * Visitors who prefer reduced motion just see the final number.
 * Screen readers get the final number once (the sr-only copy), never the counting.
 */
export default function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const parts = splitCount(value); // lib/count-up.ts: "10+" counts to 10; a year like "2026" isn't counted
  const target = parts ? parts.target : null;
  const suffix = parts ? parts.suffix : "";

  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(target);

  useEffect(() => {
    const el = ref.current;
    if (target === null || !el) return;
    if (motionReduced()) return;

    setShown(0);
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setShown(Math.round(target * eased));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target, duration]);

  if (target === null) return <span>{value}</span>;

  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">
        {shown}
        {suffix}
      </span>
    </span>
  );
}
