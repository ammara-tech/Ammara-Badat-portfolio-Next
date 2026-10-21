"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  /** How wide the image shows on screen, so the browser downloads the right size */
  sizes?: string;
  /** Set on the biggest image at the top of a page, so it loads first (better Lighthouse score) */
  priority?: boolean;
};

// Images in /public and in my Supabase Storage bucket can be resized by Next.js.
// Anything else (a link pasted in /admin) is shown as it is.
const optimizable = (src: string) =>
  src.startsWith("/") || /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//.test(src);

/**
 * Shows a screenshot with next/image: it is served as a smaller WebP/AVIF file in
 * the size the screen needs, lazy-loads, and keeps its space so the page doesn't jump.
 * If the file is missing, it shows a helpful box instead of a broken image icon.
 */
export default function Screenshot({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        className={`flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-line-strong bg-panel-alt p-4 text-center font-mono text-xs text-mist ${className}`}
      >
        {src ? `Screenshot missing: public${src}` : "No screenshot yet"}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1280}
      height={720}
      sizes={sizes}
      unoptimized={!optimizable(src)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={`aspect-video w-full rounded-lg border border-line object-cover object-top ${className}`}
    />
  );
}
