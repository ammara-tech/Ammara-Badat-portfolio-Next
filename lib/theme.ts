/*
  Light / dark mode.
  The site is dark by default (the v1 look). Choosing light mode saves
  "light" in localStorage, and the small script in app/layout.tsx applies it
  before the page paints, so there is no white or dark "flash" on load.
*/

import { motionReduced } from "@/lib/motion";

export type Theme = "dark" | "light";

const KEY = "theme";

/** Runs in <head> before anything renders. Kept tiny on purpose. Also applies the animations switch (lib/motion.ts). */
export const themeScript = `try{var d=document.documentElement;if(localStorage.getItem("${KEY}")==="light")d.dataset.theme="light";if(localStorage.getItem("motion")==="reduced")d.dataset.motion="reduced"}catch(e){}`;

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

type ViewTransition = { ready: Promise<void>; finished: Promise<void> };
type DocWithVT = Document & { startViewTransition?: (update: () => void) => ViewTransition };

/**
 * Switches the theme, remembers it, and tells the toggle buttons.
 * If the browser supports View Transitions, the new theme grows out of
 * the point (x, y) as a circle.
 */
export function setTheme(theme: Theme, from?: { x: number; y: number }) {
  const root = document.documentElement;

  const apply = () => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // private mode: the choice just won't be remembered
    }
    window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  };

  const doc = document as DocWithVT;
  const reduceMotion = motionReduced();
  if (!doc.startViewTransition || reduceMotion) {
    apply();
    return;
  }

  const x = from?.x ?? window.innerWidth / 2;
  const y = from?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  root.classList.add("theme-vt");
  const transition = doc.startViewTransition(apply);
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
  transition.finished.catch(() => {}).finally(() => root.classList.remove("theme-vt"));
}
