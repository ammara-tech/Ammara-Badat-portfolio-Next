"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";

/*
  Full-screen image viewer for certificates and case study screenshots.

  How it works: a <LightboxTrigger> button sends a "lightbox:open" event with
  the list of images and which one was clicked. The single <Lightbox /> in
  app/layout.tsx listens for it and opens a native <dialog>, which gives us
  Escape to close, a focus trap and focus going back to the button for free.
  Arrow keys and swiping move between images.
*/

export type LightboxImage = { src: string; alt: string; caption?: string };

export type OpenDetail = { images: LightboxImage[]; index: number };

export function LightboxTrigger({
  images,
  index,
  label,
  className = "",
  children,
}: {
  images: LightboxImage[];
  index: number;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      className={`cursor-zoom-in ${className}`}
      onClick={() => window.dispatchEvent(new CustomEvent<OpenDetail>("lightbox:open", { detail: { images, index } }))}
    >
      {children}
    </button>
  );
}

/** onReady: called once the viewer is listening (used by LazyExtras to show the first image) */
export default function Lightbox({ onReady }: { onReady?: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const swipeStart = useRef<number | null>(null);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [index, setIndex] = useState(0);

  const count = images.length;
  const current = images[index];

  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  // Open when a trigger is clicked
  useEffect(() => {
    const onOpen = (e: Event) => {
      const { images, index } = (e as CustomEvent<OpenDetail>).detail;
      setImages(images);
      setIndex(index);
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
      document.documentElement.style.overflow = "hidden";
    };
    window.addEventListener("lightbox:open", onOpen);
    onReady?.();
    return () => window.removeEventListener("lightbox:open", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once, when the viewer first appears
  }, []);

  // Preload the next and previous images so arrowing feels instant
  useEffect(() => {
    if (count < 2) return;
    [images[(index + 1) % count], images[(index - 1 + count) % count]].forEach((img) => {
      const pre = new Image();
      pre.src = img.src;
    });
  }, [images, index, count]);

  function close() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label={current ? `Image viewer: ${current.alt}` : "Image viewer"}
      onClose={() => {
        document.documentElement.style.overflow = "";
      }}
      onKeyDown={(e) => {
        if (count < 2) return;
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      // Clicking the dark area around the image closes it
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onPointerDown={(e) => {
        swipeStart.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (swipeStart.current === null || count < 2) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-white backdrop:bg-black/90 backdrop:backdrop-blur-sm"
    >
      {current && (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 sm:p-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          {/* Top bar: counter, open original, close */}
          <div className="flex w-full max-w-6xl items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest text-white/80">
            <span aria-live="polite">
              {count > 1 ? `${index + 1} / ${count}` : ""}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={current.src}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-white/25 px-3 py-2 text-white transition hover:border-white"
              >
                Open original ↗
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Close image viewer"
                className="rounded border border-white/25 p-2 text-white transition hover:border-white"
                autoFocus
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* The image */}
          <div className="relative flex min-h-0 w-full max-w-6xl flex-1 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              src={current.src}
              alt={current.alt}
              draggable={false}
              className="fx-zoom max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl shadow-black"
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/60 p-2.5 text-white transition hover:border-white sm:-left-2"
                >
                  <Icon name="chevron-left" className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/60 p-2.5 text-white transition hover:border-white sm:-right-2"
                >
                  <Icon name="chevron-right" className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          <p className="max-w-3xl text-center text-sm text-white/85">{current.caption ?? current.alt}</p>
        </div>
      )}
    </dialog>
  );
}
