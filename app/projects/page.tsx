import type { Metadata } from "next";
import { loadProjects, projectHref } from "@/lib/projects";
import ProjectGrid from "@/components/ProjectGrid";
import { Accent, Eyebrow, PageTitle } from "@/components/ui";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { siteUrl } from "@/lib/site";

// Always fetch fresh data, so changes from /admin show up straight away
export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Projects — Ammara Badat",
  description:
    "Web apps by Ammara Badat: a secure Next.js and Supabase clinic platform, a 10-game arcade, an F1 dashboard and more. Filter by tech.",
  path: "/projects",
});

export default async function Projects() {
  const { projects, error } = await loadProjects();

  return (
    <section>
      <JsonLd
        data={[
          breadcrumbs([{ name: "Projects", path: "/projects" }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            url: `${siteUrl}/projects`,
            name: "Projects by Ammara Badat",
            author: personRef,
            hasPart: projects.map((p) => ({ "@type": "CreativeWork", name: p.title, url: `${siteUrl}${projectHref(p)}` })),
          },
        ]}
      />
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
