"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { OpenDetail } from "@/components/Lightbox";

/*
  Performance (Milestone 5): the Ctrl+K search, the image viewer and the
  spotlight glow aren't needed to show the page, so their code is only
  downloaded and started the first time someone uses them:
  - search: on Ctrl+K, the Search button or the terminal's "search" command
  - image viewer: on the first click of a certificate or screenshot
  - spotlight: on the first mouse movement or tap
  The first use waits a fraction of a second for the code; after that it's instant.
  This keeps the page free to respond while it loads, which is what Lighthouse's
  "Total Blocking Time" measures.
*/
const CommandPalette = dynamic(() => import("@/components/CommandPalette"), { ssr: false });
const Lightbox = dynamic(() => import("@/components/Lightbox"), { ssr: false });
const Spotlight = dynamic(() => import("@/components/Spotlight"), { ssr: false });

export default function LazyExtras() {
  const [palette, setPalette] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [spotlight, setSpotlight] = useState(false);

  // What the visitor asked for before the code had arrived, so it can be done once it has
  const waiting = useRef<{ palette: boolean; lightbox: OpenDetail | null }>({ palette: false, lightbox: null });

  // Search: wait for Ctrl+K / ⌘K or a "palette:open" request
  useEffect(() => {
    if (palette) return;
    const load = () => {
      waiting.current.palette = true;
      setPalette(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        load();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", load);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", load);
    };
  }, [palette]);

  // Image viewer: wait for the first "lightbox:open" request
  useEffect(() => {
    if (lightbox) return;
    const load = (e: Event) => {
      waiting.current.lightbox = (e as CustomEvent<OpenDetail>).detail;
      setLightbox(true);
    };
    window.addEventListener("lightbox:open", load);
    return () => window.removeEventListener("lightbox:open", load);
  }, [lightbox]);

  // Spotlight: wait for the first mouse movement, or the first tap on a phone
  useEffect(() => {
    if (spotlight) return;
    const load = () => setSpotlight(true);
    window.addEventListener("pointermove", load, { once: true, passive: true });
    window.addEventListener("pointerdown", load, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointermove", load);
      window.removeEventListener("pointerdown", load);
    };
  }, [spotlight]);

  return (
    <>
      {spotlight && <Spotlight />}
      {lightbox && (
        <Lightbox
          onReady={() => {
            const detail = waiting.current.lightbox;
            waiting.current.lightbox = null;
            if (detail) window.dispatchEvent(new CustomEvent<OpenDetail>("lightbox:open", { detail }));
          }}
        />
      )}
      {palette && (
        <CommandPalette
          onReady={() => {
            if (!waiting.current.palette) return;
            waiting.current.palette = false;
            window.dispatchEvent(new Event("palette:open"));
          }}
        />
      )}
    </>
  );
}
