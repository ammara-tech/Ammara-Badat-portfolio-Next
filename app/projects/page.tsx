import type { Metadata } from "next";
import { publicClient, type Project } from "@/lib/supabase";
import Screenshot from "@/components/Screenshot";
import { Accent, Eyebrow, PageTitle, SmartLink, Tag, btnGhost, btnPrimary } from "@/components/ui";

// Always fetch fresh data, so changes from /admin show up straight away
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects — Ammara Badat",
  description: "Projects I've built, loaded live from Supabase.",
};

async function loadProjects(): Promise<{ projects: Project[]; error: string | null }> {
  try {
    const { data, error } = await publicClient()
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return { projects: [], error: error.message };
    return { projects: (data ?? []) as Project[], error: null };
  } catch (err) {
    return { projects: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// Makes the buttons on the cards a bit smaller than the big page buttons
const small = "px-4! py-2!";

function ProjectCard({ project }: { project: Project }) {
  const isCapstone = Boolean(project.case_study_url);

  return (
    <article
      className={`group rounded-xl border bg-panel p-5 transition hover:-translate-y-1 ${
        isCapstone
          ? "border-racing/50 hover:border-racing md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr] md:items-center md:gap-8"
          : "flex flex-col border-line hover:border-teal/60"
      }`}
    >
      <div className="relative">
        <Screenshot src={project.image_url} alt={`Screenshot of ${project.title}`} />
        {isCapstone && (
          <span className="absolute left-3 top-3 rounded bg-racing px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-snow">
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
              Read case study →
            </SmartLink>
          )}
          {project.live_url && (
            <SmartLink href={project.live_url} className={`${isCapstone ? btnGhost : btnPrimary} ${small}`}>
              Live site ↗
            </SmartLink>
          )}
          {project.repo_url && (
            <SmartLink href={project.repo_url} className={`${btnGhost} ${small}`}>
              GitHub
            </SmartLink>
          )}
          {project.video_url && (
            <SmartLink href={project.video_url} className={`${btnGhost} ${small}`}>
              ▶ Video
            </SmartLink>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function Projects() {
  const { projects, error } = await loadProjects();

  return (
    <section>
      <Eyebrow>Projects</Eyebrow>
      <PageTitle>
        Things I&apos;ve <Accent>built</Accent>
      </PageTitle>
      <p className="mt-5 max-w-xl text-lg text-mist">
        Projects from ITProg26 and my own time. The one marked capstone has a full case study.
      </p>

      {error && (
        <p className="mt-8 rounded border border-racing/40 bg-racing/10 p-4 text-snow">
          Couldn&apos;t load projects right now. ({error})
        </p>
      )}

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
