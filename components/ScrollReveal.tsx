"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motionReduced } from "@/lib/motion";

/*
  Cards fade up as you scroll. Newer browsers do this with CSS alone
  (scroll-driven animations in globals.css). For browsers that can't yet,
  for example older Safari on iPhone, Firefox and some Samsung Internet
  versions, this does the same with an IntersectionObserver
  (it tells us when an element scrolls into view).
*/
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (CSS.supports("animation-timeline: view()")) return;
    if (motionReduced()) return;

    document.documentElement.classList.add("fx-io");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    // Run again on every page change, because the new page has new cards
    document.querySelectorAll(".fx-reveal:not(.is-visible)").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
