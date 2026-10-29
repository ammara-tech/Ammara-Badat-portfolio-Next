import type { Metadata } from "next";
import Link from "next/link";
import { loadProjects, projectHref } from "@/lib/projects";
import ProjectGrid from "@/components/ProjectGrid";
import CurrentlyBuilding from "@/components/CurrentlyBuilding";
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
        <div role="alert" className="mt-8 rounded-xl border border-racing/40 bg-racing/10 p-5 text-snow">
          <p className="font-semibold">My projects couldn&apos;t be loaded right now.</p>
          <p className="mt-1 text-sm text-mist">
            Please refresh the page in a moment. You can still read my{" "}
            <Link href="/projects/nextjs-dashboard" className="text-teal underline underline-offset-2">
              capstone case study
            </Link>{" "}
            or see my code on{" "}
            <a href="https://github.com/ammara-tech" className="text-teal underline underline-offset-2">
              GitHub
            </a>
            .
          </p>
        </div>
      )}

      {/* Nothing in the database yet (and no error): say so instead of an empty page */}
      {!error && projects.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-line-strong p-8 text-center">
          <p className="font-display text-2xl font-black uppercase">Projects coming soon</p>
          <p className="mt-2 text-mist">
            In the meantime, have a look at my{" "}
            <Link href="/projects/nextjs-dashboard" className="text-teal underline underline-offset-2">
              capstone case study
            </Link>
            .
          </p>
        </div>
      )}

      {/* Tag filter and cards (components/ProjectGrid.tsx) */}
      {projects.length > 0 && <ProjectGrid projects={projects} />}

      {/* What I'm working on now (content/currently-building.ts); hidden when the list is empty */}
      <CurrentlyBuilding />
    </section>
  );
}
