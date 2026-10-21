import { publicClient, type Project } from "@/lib/supabase";
import { slugify } from "@/lib/slug";

export { slugify, projectHref } from "@/lib/slug";

/*
  Shared helpers for loading projects from Supabase.
  Used by the Projects page, each project's own page and the sitemap.
*/

export async function loadProjects(): Promise<{ projects: Project[]; error: string | null }> {
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

export async function findProject(slug: string) {
  const { projects } = await loadProjects();
  const index = projects.findIndex((p) => slugify(p.title) === slug);
  if (index === -1) return null;
  return { project: projects[index], others: projects.filter((_, i) => i !== index) };
}
