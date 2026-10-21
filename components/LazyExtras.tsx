"use client";

import dynamic from "next/dynamic";

/*
  Performance (Milestone 5): the Ctrl+K search, the image viewer and the
  spotlight glow aren't needed to show the page, so their code is downloaded
  and started only after the page has loaded. This cut the JavaScript that
  runs at load time, which is what Lighthouse's "Total Blocking Time" measures.
*/
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const Lightbox = dynamic(() => import("@/components/Lightbox"), { ssr: false });
const Spotlight = dynamic(() => import("@/components/Spotlight"), { ssr: false });

export default function LazyExtras() {
  return (
    <>
      <Spotlight />
      <Lightbox />
      <CommandPalette />
    </>
  );
}
