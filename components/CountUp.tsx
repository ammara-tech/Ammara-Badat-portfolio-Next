"use client";

import { useEffect, useRef, useState } from "react";
import { motionReduced } from "@/lib/motion";

/**
 * Counts a number up from 0 when it scrolls into view, e.g. "10+" or "7".
 * Years (4 digits) and text without a number are shown as they are.
 * Visitors who prefer reduced motion just see the final number.
 */
export default function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const match = value.match(/^(\d{1,3})(.*)$/);
  const target = match ? Number(match[1]) : null;
  const suffix = match ? match[2] : "";

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
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {shown}
        {suffix}
      </span>
    </span>
  );
}
