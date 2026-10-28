import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { findProject, projectHref } from "@/lib/projects";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Screenshot from "@/components/Screenshot";
import Icon from "@/components/Icon";
import { LightboxTrigger } from "@/components/Lightbox";
import { Accent, Eyebrow, SmartLink, btnGhost, btnIcon, btnPrimary, card } from "@/components/ui";
import CopyLink from "@/components/CopyLink";

/*
  A page for every project, e.g. /projects/myflix.
  The address comes from the project's title, and the content comes live
  from Supabase, so a project added in /admin gets its own page (and a place
  in the sitemap) automatically.
*/

// Always fetch fresh data, the same as the Projects page
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// A short description for Google: the summary, cut to about 155 characters
function describe(summary: string | null, title: string) {
  const text = summary?.trim() || `${title}, a project by Ammara Badat, junior full stack developer.`;
  return text.length > 155 ? `${text.slice(0, 152).replace(/\s+\S*$/, "")}…` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await findProject(slug);
  if (!found) return { title: "Project not found — Ammara Badat", robots: { index: false } };

  const { project } = found;
  return pageMetadata({
    title: `${project.title} — Projects — Ammara Badat`,
    description: describe(project.summary, project.title),
    path: `/projects/${slug}`,
    type: "article",
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const found = await findProject(slug);
  // No loading screen on this route, so this runs before anything is sent:
  // a wrong address gets a real 404 status, not a 200 page that says "not found"
  if (!found) notFound();

  const { project, others } = found;

  // The capstone already has a full case study page
  if (project.case_study_url) permanentRedirect(project.case_study_url);

  const words = project.title.split(" ");
  const more = others.slice(0, 3);

  const structuredData = [
    breadcrumbs([
      { name: "Projects", path: "/projects" },
      { name: project.title, path: `/projects/${slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: project.title,
      description: project.summary ?? undefined,
      url: `${siteUrl}/projects/${slug}`,
      image: project.image_url
        ? project.image_url.startsWith("/")
          ? `${siteUrl}${project.image_url}`
          : project.image_url
        : undefined,
      keywords: project.tags.join(", "),
      author: personRef,
      creator: personRef,
      sameAs: [project.live_url, project.repo_url].filter(Boolean),
    },
  ];

  return (
    <article>
      <JsonLd data={structuredData} />

      {/* Breadcrumbs: Home › Projects › This project */}
      <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-widest text-mist">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-teal">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/projects" className="hover:text-teal">
              Projects
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-snow">
            {project.title}
          </li>
        </ol>
      </nav>

      <header className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div className="min-w-0">
          <Eyebrow>Project</Eyebrow>
          <h1 className="fx-rise font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            {words.length > 1 ? (
              <>
                {words.slice(0, -1).join(" ")} <Accent>{words.at(-1)}</Accent>
              </>
            ) : (
              <Accent>{project.title}</Accent>
            )}
          </h1>

          {project.summary && (
            <p className="fx-rise mt-6 text-lg leading-relaxed text-mist" style={{ animationDelay: "120ms" }}>
              {project.summary}
            </p>
          )}

          {project.tags.length > 0 && (
            <div className="fx-rise mt-6" style={{ animationDelay: "200ms" }}>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-mist">Built with</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/projects?tag=${encodeURIComponent(tag)}`}
                      className="inline-block rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-mist transition hover:border-teal hover:text-teal"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="fx-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "280ms" }}>
            {project.live_url && (
              <SmartLink href={project.live_url} className={btnPrimary}>
                Live site
                <Icon name="arrow-up-right" className={`h-3.5 w-3.5 ${btnIcon}`} />
              </SmartLink>
            )}
            {project.repo_url && (
              <SmartLink href={project.repo_url} className={btnGhost}>
                <Icon name="github" className="h-4 w-4" />
                Code on GitHub
              </SmartLink>
            )}
            {project.video_url && (
              <SmartLink href={project.video_url} className={btnGhost}>
                <Icon name="play" className="h-4 w-4" />
                Watch the video
              </SmartLink>
            )}
            <CopyLink url={`${siteUrl}/projects/${slug}`} label={project.title} />
          </div>
        </div>

        <figure className="fx-rise" style={{ animationDelay: "160ms" }}>
          {project.image_url ? (
            <LightboxTrigger
              images={[{ src: project.image_url, alt: `Screenshot of ${project.title}`, caption: project.title }]}
              index={0}
              label={`Enlarge the screenshot of ${project.title}`}
              className="group relative block w-full overflow-hidden rounded-lg text-left"
            >
              <Screenshot
                src={project.image_url}
                alt={`Screenshot of ${project.title}`}
                sizes="(min-width: 1024px) 600px, 100vw"
                priority
                className="transition duration-700 group-hover:scale-[1.02]"
              />
            </LightboxTrigger>
          ) : (
            <Screenshot src={null} alt="" />
          )}
        </figure>
      </header>

      {/* More projects */}
      {more.length > 0 && (
        <section aria-labelledby="more-title" className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="more-title" className="fx-reveal font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
              More <Accent>projects</Accent>
            </h2>
            <Link href="/projects" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-teal">
              All projects
              <Icon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((other) => (
              <li key={other.id}>
                <Link
                  href={projectHref(other)}
                  className={`${card} spotlight fx-reveal group block h-full p-4 transition hover:-translate-y-1 hover:border-teal/60`}
                >
                  <span className="block overflow-hidden rounded-lg">
                    <Screenshot
                      src={other.image_url}
                      alt=""
                      sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                      className="transition duration-700 group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className="mt-4 block font-display text-xl font-black uppercase tracking-tight">{other.title}</span>
                  <span className="mt-1 block font-mono text-[11px] uppercase tracking-wider text-mist">
                    {other.case_study_url ? "Case study" : other.tags.slice(0, 3).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

