"use client";

import Image from "next/image";
import { useState } from "react";
import type { ThenAndNow } from "@/content/then-and-now";

/*
  A before-and-after slider: the "after" picture fills the frame, and the "before" picture is
  shown up to the line. Dragging moves the line. It's a real range input stretched over the
  pictures (invisible), so it works with a mouse, a finger and the arrow keys, and a screen
  reader announces how far it is.
*/
export default function BeforeAfter({ data }: { data: ThenAndNow }) {
  const [pos, setPos] = useState(50);
  return (
    <figure>
      <div className="group relative aspect-[1280/715] overflow-hidden rounded-xl border border-line bg-panel focus-within:ring-2 focus-within:ring-teal">
        <Image src={data.after.src} alt={data.after.label} fill sizes="(min-width: 1024px) 1100px, 100vw" className="object-cover object-top" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={data.before.src} alt={data.before.label} fill sizes="(min-width: 1024px) 1100px, 100vw" className="object-cover object-top" />
        </div>

        {/* The line and its handle */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 bg-teal shadow-[0_0_12px_rgb(0_0_0/0.5)]" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-teal bg-ink font-mono text-sm font-bold text-teal">
            ⇆
          </span>
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 rounded bg-ink/85 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-snow">
          {data.before.label}
        </span>
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3 rounded bg-ink/85 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-snow">
          {data.after.label}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Compare: ${data.before.label}, and ${data.after.label}`}
          aria-valuetext={`${pos}% ${data.before.label}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-mist">{data.caption}</figcaption>
    </figure>
  );
}
