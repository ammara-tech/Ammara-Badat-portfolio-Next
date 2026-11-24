"use client";

import { useEffect } from "react";

/*
  Registers public/sw.js, the small background script that shows my Endless Dash game
  when a page can't load (no internet, or a very slow connection). It runs once the page
  has finished loading and the browser is idle, so it never slows the first visit.
  It does nothing in development, where an old saved copy would make changes hard to see.
*/
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const register = () => {
      const go = () => navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
      if ("requestIdleCallback" in window) window.requestIdleCallback(go, { timeout: 4000 });
      else timer = setTimeout(go, 2000);
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => {
      window.removeEventListener("load", register);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}
