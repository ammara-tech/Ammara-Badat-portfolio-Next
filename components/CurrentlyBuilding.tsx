import { currentlyBuilding } from "@/content/currently-building";
import { SectionTitle } from "@/components/ui";

/*
  "Currently building" section under my projects: what I'm working on now, then what's next.
  The cards are deliberately plainer than real project cards (dashed border,
  no links), so nobody mistakes them for finished work. In progress has a pulsing
  dot; Up next is quieter, because it hasn't started yet.
  It hides itself when content/currently-building.ts is empty.
*/
export default function CurrentlyBuilding() {
  if (currentlyBuilding.length === 0) return null;
  // What I'm building now comes first, then what's next
  const projects = [...currentlyBuilding].sort((a, b) => Number(a.stage === "next") - Number(b.stage === "next"));

  return (
    <section aria-labelledby="building-title" className="mt-20">
      <SectionTitle id="building-title">Currently building</SectionTitle>
      <p className="mt-3 max-w-xl text-mist">What I&apos;m working on now, and what&apos;s next. Each one gets a full project page when it&apos;s live.</p>
      <ul className="mt-8 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <li key={project.name} className="rounded-xl border border-dashed border-line-strong p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl font-black uppercase tracking-tight">{project.name}</h3>
              {project.stage === "building" ? (
                <span className="flex items-center gap-2 rounded-full border border-teal/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-teal">
                  <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal motion-reduce:animate-none" />
                  In progress
                </span>
              ) : (
                <span className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-mist">
                  Up next
                </span>
              )}
            </div>
            <p className="mt-3 leading-relaxed text-mist">{project.summary}</p>
            <ul aria-label="Built with" className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-mist"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
