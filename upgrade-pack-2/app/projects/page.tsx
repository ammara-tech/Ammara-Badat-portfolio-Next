import type { Metadata } from "next";
import { publicClient, type Project } from "@/lib/supabase";
import ProjectGrid from "@/components/ProjectGrid";
import { Accent, Eyebrow, PageTitle } from "@/components/ui";

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

export default async function Projects() {
  const { projects, error } = await loadProjects();

  return (
    <section>
      <Eyebrow>Projects</Eyebrow>
      <PageTitle>
        Things I&apos;ve <Accent>built</Accent>
      </PageTitle>
      <p className="fx-rise mt-5 max-w-xl text-lg text-mist" style={{ animationDelay: "180ms" }}>
        Projects from ITProg26 and my own time. The one marked capstone has a full case study.
      </p>

      {error && (
        <p className="mt-8 rounded border border-racing/40 bg-racing/10 p-4 text-snow">
          Couldn&apos;t load projects right now. ({error})
        </p>
      )}

      {/* Tag filter and cards (components/ProjectGrid.tsx) */}
      <ProjectGrid projects={projects} />
    </section>
  );
}
