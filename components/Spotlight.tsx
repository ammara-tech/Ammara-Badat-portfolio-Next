"use client";

import { useEffect } from "react";

/*
  Spotlight cards. Any element with the "spotlight" class gets a glow that
  follows the mouse (the look is in globals.css). One listener for the whole
  site is cheaper than one per card. Phones and tablets have no hover, so it
  does nothing there.
*/
export default function Spotlight() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const card = target?.closest<HTMLElement>(".spotlight");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
