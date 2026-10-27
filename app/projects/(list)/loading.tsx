import { Accent, Eyebrow, PageTitle } from "@/components/ui";

/*
  Shown automatically by Next.js while the projects load from Supabase.

  It lives in the (list) folder with the Projects page, so it only covers /projects.
  The brackets make (list) a "route group": it organises files without changing the
  address. If this file sat directly in app/projects/, it would also wrap every
  project page, and Next.js would start sending the loading screen (with status 200)
  before it knew whether the project exists, so a wrong address could never be a 404.
*/

function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-panel-alt ${className}`} />;
}

export default function LoadingProjects() {
  return (
    <section aria-busy="true" aria-label="Loading projects">
      <Eyebrow>Projects</Eyebrow>
      <PageTitle>
        Things I&apos;ve <Accent>built</Accent>
      </PageTitle>
      <Bar className="mt-6 h-5 w-80 max-w-full" />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`rounded-xl border border-line bg-panel p-5 ${i === 0 ? "md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr] md:gap-8" : ""}`}
          >
            <Bar className="aspect-video w-full rounded-lg!" />
            <div>
              <Bar className="mt-5 h-7 w-2/3" />
              <Bar className="mt-3 h-4 w-full" />
              <Bar className="mt-2 h-4 w-4/5" />
              <div className="mt-5 flex gap-2">
                <Bar className="h-6 w-16 rounded-full!" />
                <Bar className="h-6 w-14 rounded-full!" />
                <Bar className="h-6 w-12 rounded-full!" />
              </div>
              <div className="mt-6 flex gap-3">
                <Bar className="h-9 w-28" />
                <Bar className="h-9 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
