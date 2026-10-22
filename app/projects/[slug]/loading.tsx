/* Shown automatically by Next.js while one project loads from Supabase */

function Bar({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-panel-alt ${className}`} />;
}

export default function LoadingProject() {
  return (
    <section aria-busy="true" aria-label="Loading project">
      <Bar className="h-3 w-48" />
      <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <Bar className="h-3 w-24" />
          <Bar className="mt-4 h-12 w-3/4" />
          <Bar className="mt-6 h-4 w-full" />
          <Bar className="mt-2 h-4 w-5/6" />
          <div className="mt-6 flex gap-2">
            <Bar className="h-7 w-20 rounded-full!" />
            <Bar className="h-7 w-16 rounded-full!" />
            <Bar className="h-7 w-24 rounded-full!" />
          </div>
          <div className="mt-8 flex gap-3">
            <Bar className="h-11 w-36" />
            <Bar className="h-11 w-40" />
          </div>
        </div>
        <Bar className="aspect-video w-full rounded-lg!" />
      </div>
    </section>
  );
}
