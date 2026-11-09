import Link from "next/link";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import { Accent, Eyebrow, PageTitle, card } from "@/components/ui";
import { about } from "@/content/about";
import { currentlyBuilding } from "@/content/currently-building";
import { journey, journeyDate } from "@/content/journey";
import { formatDate } from "@/content/notes";
import { now } from "@/content/now";
import { breadcrumbs, pageMetadata } from "@/lib/seo";

/*
  /now: what I'm building, learning and looking for this month.
  The words are in content/now.ts. "Building" and "Recently shipped" come from
  content/currently-building.ts and content/journey.ts, so they update themselves.
*/

export const metadata: Metadata = pageMetadata({
  title: "Now — Ammara Badat",
  description: "What Ammara Badat is building, learning and looking for this month.",
  path: "/now",
});

function List({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 leading-relaxed text-mist">
          <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Now() {
  const shipped = [...journey].reverse().slice(0, 3);
  const box = `${card} fx-reveal p-6`;
  const heading = "flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-teal";

  return (
    <section>
      <JsonLd data={[breadcrumbs([{ name: "Now", path: "/now" }])]} />
      <Eyebrow>Now</Eyebrow>
      <PageTitle>
        What I&apos;m doing <Accent>now</Accent>
      </PageTitle>
      <p className="fx-rise mt-5 max-w-2xl text-lg leading-relaxed text-snow" style={{ animationDelay: "180ms" }}>
        {now.focus}
      </p>
      <p className="fx-rise mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-widest text-mist" style={{ animationDelay: "220ms" }}>
        <span className="flex items-center gap-1.5">
          <Icon name="map-pin" className="h-3.5 w-3.5" />
          {about.location}
        </span>
        <span>
          Updated <time dateTime={now.updated}>{formatDate(now.updated)}</time>
        </span>
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className={box}>
          <h2 className={heading}>
            <Icon name="code" className="h-4 w-4" />
            Building next
          </h2>
          <List items={currentlyBuilding.map((p) => `${p.name}: ${p.summary}`)} />
          <h3 className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-mist">And improving</h3>
          <List items={now.improving} />
        </div>

        <div className={box}>
          <h2 className={heading}>
            <Icon name="academic-cap" className="h-4 w-4" />
            Learning
          </h2>
          <List items={now.learning} />
        </div>

        <div className={box}>
          <h2 className={heading}>
            <Icon name="sparkles" className="h-4 w-4" />
            Recently shipped
          </h2>
          <ul className="mt-4 space-y-3">
            {shipped.map((s) => (
              <li key={s.title} className="flex flex-wrap items-baseline justify-between gap-x-3">
                {s.href ? (
                  <Link href={s.href} className="font-semibold text-snow hover:text-teal">
                    {s.title}
                  </Link>
                ) : (
                  <span className="font-semibold text-snow">{s.title}</span>
                )}
                <time dateTime={s.date} className="font-mono text-xs uppercase tracking-widest text-mist">
                  {journeyDate(s.date)}
                </time>
              </li>
            ))}
          </ul>
          <Link href="/about#journey" className="mt-5 inline-block font-mono text-xs uppercase tracking-widest text-teal hover:underline">
            My whole journey
          </Link>
        </div>

        <div className={box}>
          <h2 className={heading}>
            <Icon name="user" className="h-4 w-4" />
            Looking for
          </h2>
          <List items={about.lookingFor} />
          <Link href="/recruiters" className="mt-5 inline-block font-mono text-xs uppercase tracking-widest text-teal hover:underline">
            For recruiters: me in 60 seconds
          </Link>
        </div>
      </div>
    </section>
  );
}
