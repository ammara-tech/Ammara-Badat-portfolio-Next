import type { Metadata } from "next";
import { skillGroups } from "@/content/skills";
import { Accent, Eyebrow, PageTitle, SectionTitle, card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Skills — Ammara Badat",
  description: "My skills, each linked to a project, file, commit or live page that proves it.",
};

export default function Skills() {
  return (
    <section>
      <Eyebrow>Skills</Eyebrow>
      <PageTitle>
        What I <Accent>work with</Accent>
      </PageTitle>
      <p className="mt-5 max-w-2xl text-lg text-mist">
        Every skill here links to proof: a project, a file in a repo, a commit or a live page. If I
        can&apos;t link to it, it isn&apos;t listed.
      </p>

      <div className="mt-14 space-y-14">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <SectionTitle>{group.title}</SectionTitle>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {group.skills.map((skill) => (
                <li key={skill.name} className={`${card} p-5 transition hover:border-teal/50`}>
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight">{skill.name}</h3>
                  <p className="mt-1 text-sm text-mist">{skill.note}</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-mist-dim">Evidence</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {skill.evidence.map((ev) => (
                      <li key={ev.href + ev.label}>
                        <a
                          href={ev.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block rounded border border-line-strong px-2.5 py-1 font-mono text-xs text-teal transition hover:border-teal hover:bg-teal/10"
                        >
                          {ev.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
