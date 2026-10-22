"use client";

import Link from "next/link";
import { useEffect } from "react";
import Icon from "@/components/Icon";
import { Accent, btnGhost, btnIcon, btnPrimary } from "@/components/ui";

/*
  Shown instead of a broken page if something goes wrong while a page loads,
  for example if Supabase can't be reached. "Try again" re-loads just this page.
*/
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Shows up in Vercel's logs so I can see what went wrong
    console.error(error);
  }, [error]);

  return (
    <section className="py-10">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">Something went wrong</p>
      <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl">
        Pit <Accent>stop.</Accent>
      </h1>
      <p className="mt-5 max-w-md text-lg text-mist">
        This page couldn&apos;t load just now. It&apos;s usually a short hiccup, so please try again.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <button type="button" onClick={reset} className={btnPrimary}>
          Try again
          <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
        </button>
        <Link href="/" className={btnGhost}>
          Back home
        </Link>
      </div>
      {error.digest && <p className="mt-8 font-mono text-xs text-mist">Error reference: {error.digest}</p>}
    </section>
  );
}
