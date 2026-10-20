"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

/**
 * Shows a screenshot. If the file is missing, it shows a helpful box
 * with the path it expected, instead of a broken image icon.
 */
export default function Screenshot({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-line-strong bg-panel-alt p-4 text-center font-mono text-xs text-mist ${className}`}
      >
        {src ? `Screenshot missing: public${src}` : "No screenshot yet"}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`aspect-video w-full rounded-lg border border-line object-cover object-top ${className}`}
    />
  );
}
