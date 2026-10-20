"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import type { Project } from "@/lib/supabase";
import Screenshot from "@/components/Screenshot";
import Icon from "@/components/Icon";
import { SmartLink, Tag, btnGhost, btnIcon, btnPrimary } from "@/components/ui";

/*
  The project cards plus the tag filter.
  The tags come from the projects themselves (whatever I typed in /admin),
  so a new tag shows up as a filter automatically.
  The chosen tag is kept in the address (?tag=Next.js) so a filtered view
  can be shared. Cards slide into place using the View Transitions API
  where the browser supports it.
*/

// Makes the buttons on the cards a bit smaller than the big page buttons
const small = "px-4! py-2!";

type DocWithVT = Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } };

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string | null>(null);

  // Tags sorted by how many projects use them, most used first
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects]);

  // Read ?tag= from the address on first load
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tag");
    if (fromUrl && tags.some(([t]) => t === fromUrl)) setActive(fromUrl);
  }, [tags]);

  const visible = active ? projects.filter((p) => p.tags.includes(active)) : projects;

  function choose(tag: string | null) {
    const next = tag === active ? null : tag;

    const url = new URL(window.location.href);
    if (next) url.searchParams.set("tag", next);
    else url.searchParams.delete("tag");
    window.history.replaceState(null, "", url);

    const doc = document as DocWithVT;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduceMotion) {
      setActive(next);
      return;
    }

    const root = document.documentElement;
    root.classList.add("filter-vt");
    const transition = doc.startViewTransition(() => {
      flushSync(() => setActive(next));
    });
    transition.finished.catch(() => {}).finally(() => root.classList.remove("filter-vt"));
  }

  const chip = (selected: boolean) =>
    `rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
      selected
        ? "border-racing bg-racing text-white"
        : "border-line-strong text-mist hover:border-teal hover:text-teal"
    }`;

  return (
    <>
      {tags.length > 1 && (
        <div className="fx-rise mt-10" style={{ animationDelay: "240ms" }}>
          <p id="filter-label" className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-mist">
            <Icon name="tag" className="h-4 w-4 text-teal" />
            Filter by tech
          </p>
          <div role="group" aria-labelledby="filter-label" className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => choose(null)} aria-pressed={active === null} className={chip(active === null)}>
              All <span className="opacity-70">{projects.length}</span>
            </button>
            {tags.map(([tag, count]) => (
              <button
                key={tag}
                type="button"
                onClick={() => choose(tag)}
                aria-pressed={active === tag}
                className={chip(active === tag)}
              >
                {tag} <span className="opacity-70">{count}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-mist" aria-live="polite">
            {active ? `Showing ${visible.length} of ${projects.length} projects using ${active}.` : `Showing all ${projects.length} projects.`}
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const isCapstone = Boolean(project.case_study_url);

  return (
    <article
      style={{ "--vt": `project-${project.id}` } as React.CSSProperties}
      className={`vt-card spotlight fx-reveal group rounded-xl border bg-panel p-5 transition duration-300 hover:-translate-y-1 ${
        isCapstone
          ? "spotlight-red border-racing/50 hover:border-racing hover:shadow-[0_0_60px_-15px_rgb(232_0_45/0.45)] md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr] md:items-center md:gap-8"
          : "flex flex-col border-line hover:border-teal/60 hover:shadow-[0_0_50px_-18px_rgb(39_244_210/0.4)]"
      }`}
    >
      <div className="relative overflow-hidden rounded-lg">
        <Screenshot
          src={project.image_url}
          alt={`Screenshot of ${project.title}`}
          className="transition duration-700 group-hover:scale-[1.04]"
        />
        {isCapstone && (
          <span className="absolute left-3 top-3 rounded bg-racing px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-white">
            Capstone
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col">
        <h2
          className={`mt-5 font-display text-2xl font-black uppercase tracking-tight ${isCapstone ? "md:mt-0 md:text-4xl" : ""}`}
        >
          {project.title}
        </h2>
        {project.summary && <p className="mt-2 leading-relaxed text-mist">{project.summary}</p>}

        {project.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </ul>
        )}

        <div className="mt-auto flex flex-wrap gap-3 pt-6">
          {project.case_study_url && (
            <SmartLink href={project.case_study_url} className={`${btnPrimary} ${small}`}>
              <Icon name="document" className="h-4 w-4" />
              Read case study
              <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
            </SmartLink>
          )}
          {project.live_url && (
            <SmartLink href={project.live_url} className={`${isCapstone ? btnGhost : btnPrimary} ${small}`}>
              Live site
              <Icon name="arrow-up-right" className={`h-3.5 w-3.5 ${btnIcon}`} />
            </SmartLink>
          )}
          {project.repo_url && (
            <SmartLink href={project.repo_url} className={`${btnGhost} ${small}`}>
              <Icon name="github" className="h-4 w-4" />
              GitHub
            </SmartLink>
          )}
          {project.video_url && (
            <SmartLink href={project.video_url} className={`${btnGhost} ${small}`}>
              <Icon name="play" className="h-4 w-4" />
              Video
            </SmartLink>
          )}
        </div>
      </div>
    </article>
  );
}
