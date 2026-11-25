import Link from "next/link";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import { Accent, Eyebrow, PageTitle, btnGhost, btnIcon, btnPrimary, card } from "@/components/ui";
import { about } from "@/content/about";
import { REPO_URL, howBuilt } from "@/content/how-built";
import { notes } from "@/content/notes";
import { recruiters } from "@/content/recruiters";
import { breadcrumbs, pageMetadata } from "@/lib/seo";

/*
  /how-its-built: how this portfolio is made and how I know it works, in one place.
  The words are in content/how-built.ts. The numbers come from the rest of the site
  (recruiters.ts, notes.ts and about.ts), so they never go out of date.
*/

export const metadata: Metadata = pageMetadata({
  title: "How this site is built — Ammara Badat",
  description:
    "How Ammara Badat's portfolio is built and checked: the stack, automated tests, security, Lighthouse scores and an offline game, with the proof for each.",
  path: "/how-its-built",
});

const linkClass = "text-teal underline underline-offset-2 transition hover:text-snow";

function BuiltLinkItem({ href, label }: { href: string; label: string }) {
  // The game is a separate static page (public/dash.html), so it's a plain link, not Next.js routing
  if (href === "/dash-game") {
    return (
      <a href={href} className={linkClass}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  );
}

export default function HowItsBuilt() {
  const { lighthouse } = about;
  const l = lighthouse.laptop;
  const p = lighthouse.phone;
  const stats = [
    { value: String(recruiters.liveApps), label: "apps live, each with its own look" },
    { value: String(notes.length), label: "dev notes about what I built and learned" },
    { value: `${l.performance} · ${l.accessibility} · ${l.bestPractices} · ${l.seo}`, label: "Lighthouse on a laptop: speed, accessibility, best practices, SEO" },
    { value: `${p.performance} · ${p.accessibility} · ${p.bestPractices} · ${p.seo}`, label: `Lighthouse on a phone (speed moves between ${lighthouse.phonePerformanceRange})` },
  ];

  return (
    <section>
      <JsonLd data={[breadcrumbs([{ name: "How it's built", path: "/how-its-built" }])]} />
      <Eyebrow>How it&apos;s built</Eyebrow>
      <PageTitle>
        How this site is <Accent>built</Accent>
      </PageTitle>
      <p className="fx-rise mt-5 max-w-2xl text-lg leading-relaxed text-mist" style={{ animationDelay: "180ms" }}>
        {howBuilt.intro}
      </p>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} fx-reveal flex flex-col-reverse justify-end gap-2 p-5`}>
            <dt className="text-sm leading-snug text-mist">{s.label}</dt>
            <dd className="font-display text-2xl font-black leading-tight text-snow">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {howBuilt.sections.map((section) => (
          <article key={section.id} aria-labelledby={`${section.id}-title`} className={`${card} fx-reveal p-6`}>
            <h2 id={`${section.id}-title`} className="font-mono text-xs uppercase tracking-[0.18em] text-teal">
              {section.title}
            </h2>
            <p className="mt-3 leading-relaxed text-mist">{section.text}</p>
            {section.items && (
              <ul className="mt-4 space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed text-mist">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm">
              {section.links.map((link) => (
                <li key={link.href}>
                  <BuiltLinkItem href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="fx-reveal mt-12 flex flex-wrap items-center gap-4">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
          Read the code on GitHub
          <Icon name="arrow-up-right" className={`h-4 w-4 ${btnIcon}`} />
        </a>
        <Link href="/projects" className={btnGhost}>
          See my projects
        </Link>
      </div>
    </section>
  );
}
