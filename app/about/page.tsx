import Link from "next/link";
import type { Metadata } from "next";
import { about } from "@/content/about";
import { Accent, Eyebrow, PageTitle, Para, SectionTitle, btnGhost, btnPrimary, card } from "@/components/ui";

export const metadata: Metadata = {
  title: "About — Ammara Badat",
  description: "Who I am and the role I'm looking for.",
};

export default function About() {
  return (
    <div className="space-y-16">
      {/* 30-second intro */}
      <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Eyebrow>About me</Eyebrow>
          <PageTitle>
            Who <Accent>I am</Accent>
          </PageTitle>

          <div className="mt-8 space-y-5 text-lg">
            {about.paragraphs.map((text, i) => (
              <Para key={i} text={text} className="leading-relaxed text-mist first:text-snow" />
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/projects" className={btnPrimary}>
              See my projects →
            </Link>
            <Link href="/skills" className={btnGhost}>
              Skills & evidence
            </Link>
          </div>
        </div>

        {/* What I'm looking for */}
        <aside className={`${card} h-fit border-l-[3px] border-l-racing p-6`}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">The role I want</p>
          <p className="mt-2 font-display text-2xl font-black uppercase">{about.role}</p>
          <ul className="mt-5 space-y-3">
            {about.lookingFor.map((item, i) =>
              item.startsWith("TODO") ? (
                <li key={i}>
                  <Para text={item} />
                </li>
              ) : (
                <li key={i} className="flex gap-3 text-mist">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </aside>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        {about.stats.map((stat) => (
          <div key={stat.label} className={`${card} p-6`}>
            <p className="font-display text-4xl font-black text-snow">{stat.value}</p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-mist">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Education */}
      <section>
        <SectionTitle>
          How I <Accent>got here</Accent>
        </SectionTitle>
        <div className={`${card} mt-6 grid gap-4 p-6 sm:grid-cols-[6rem_1fr]`}>
          <p className="font-mono text-sm text-teal">{about.education.year}</p>
          <div>
            <h3 className="font-display text-xl font-bold uppercase">{about.education.title}</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-mist">{about.education.school}</p>
            <p className="mt-3 leading-relaxed text-mist">{about.education.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
