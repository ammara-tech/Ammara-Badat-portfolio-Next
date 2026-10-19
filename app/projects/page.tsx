import { publicClient, type Project } from "@/lib/supabase";

// Always fetch fresh data, so changes from /admin show up straight away
export const dynamic = "force-dynamic";

export default async function Projects() {
  const { data, error } = await publicClient()
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  const projects = (data ?? []) as Project[];

  return (
    <section>
      <h1 className="text-4xl font-bold">Projects</h1>
      <p className="mt-2 text-neutral-400">Things I&apos;ve built during ITProg26 and beyond.</p>

      {error && (
        <p className="mt-8 rounded border border-red-500/40 bg-red-500/10 p-4 text-red-300">
          Couldn&apos;t load projects right now. Please try again later.
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.id}
            className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-5"
          >
            {project.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.image_url}
                alt={`Screenshot of ${project.title}`}
                className="mb-4 aspect-video w-full rounded-lg object-cover"
              />
            )}

            <h2 className="text-xl font-semibold">{project.title}</h2>
            {project.summary && <p className="mt-2 text-neutral-400">{project.summary}</p>}

            {project.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-neutral-300"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex gap-3 pt-5">
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950"
                >
                  Live Site →
                </a>
              )}
              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-white/20 px-4 py-2 text-sm"
                >
                  GitHub
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}