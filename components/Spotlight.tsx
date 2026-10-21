"use client";

import { useEffect } from "react";

/*
  Spotlight cards. Any element with the "spotlight" class gets a glow that
  follows the mouse (the look is in globals.css). One listener for the whole
  site is cheaper than one per card. On phones and tablets the glow appears
  where you tap instead.
*/
export default function Spotlight() {
  useEffect(() => {
    const place = (card: HTMLElement, e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    // Phones and tablets: the glow lights up where you tap, then fades
    if (!window.matchMedia("(hover: hover)").matches) {
      const onTap = (e: PointerEvent) => {
        const card = e.target instanceof Element ? e.target.closest<HTMLElement>(".spotlight") : null;
        if (!card) return;
        place(card, e);
        card.classList.add("is-touched");
        window.setTimeout(() => card.classList.remove("is-touched"), 700);
      };
      document.addEventListener("pointerdown", onTap, { passive: true });
      return () => document.removeEventListener("pointerdown", onTap);
    }

    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const card = target?.closest<HTMLElement>(".spotlight");
      if (!card) return;
      place(card, e);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
