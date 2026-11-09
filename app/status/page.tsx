import Link from "next/link";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import { scoreWords } from "@/components/LighthouseBadge";
import { Accent, Eyebrow, PageTitle, card } from "@/components/ui";
import { about } from "@/content/about";
import { lighthouseScores, type Scores } from "@/content/status";
import { clockIn, MY_TIME_ZONE } from "@/lib/local-time";
import { loadProjects, slugify } from "@/lib/projects";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import { checkSite, shortUrl, SLOW_MS, summary, type Health } from "@/lib/status";

/*
  /status: are my live sites up right now, and how do they score in Lighthouse?
  The list of sites comes from my projects in Supabase (every project with a live link), so a
  new app appears here by itself. The server checks them all at the same time (lib/status.ts),
  and Next.js keeps the result for 5 minutes (revalidate), so the sites aren't asked on every visit.
  Lighthouse scores are the ones I measured with PageSpeed Insights (content/status.ts).
*/

export const metadata: Metadata = pageMetadata({
  title: "Status — Ammara Badat",
  description: "Whether each of Ammara Badat's live sites and apps is up right now, how quickly it answers, and its Lighthouse scores.",
  path: "/status",
});

// Check again at most every 5 minutes
export const revalidate = 300;

const HEALTH: Record<Health, { label: string; dot: string; text: string }> = {
  up: { label: "Up", dot: "bg-teal", text: "text-teal" },
  slow: { label: "Slow", dot: "bg-[#f5b400]", text: "text-snow" },
  down: { label: "Down", dot: "bg-racing", text: "text-racing-text" },
};

function ScoreRow({ label, scores }: { label: string; scores: Scores }) {
  const values = [scores.performance, scores.accessibility, scores.bestPractices, scores.seo];
  return (
    <p className="flex items-center gap-2 font-mono text-xs">
      <span className="w-12 uppercase tracking-widest text-mist">{label}</span>
      <span aria-hidden="true" className="flex gap-1.5">
        {values.map((v, i) => (
          <span key={i} className={`min-w-8 rounded border px-1.5 py-0.5 text-center ${v >= 90 ? "border-teal/40 text-teal" : "border-line-strong text-snow"}`}>
            {v}
          </span>
        ))}
      </span>
      <span className="sr-only">{scoreWords(scores)}</span>
    </p>
  );
}

export default async function Status() {
  const { projects, error } = await loadProjects();
  const sites = projects.filter((p) => p.live_url);
  const checks = await Promise.all(sites.map((p) => checkSite(p.live_url as string)));
  const checkedAt = clockIn(new Date(), MY_TIME_ZONE);
  const allUp = checks.every((c) => c.health !== "down");

  return (
    <section>
      <JsonLd data={[breadcrumbs([{ name: "Status", path: "/status" }])]} />
      <Eyebrow>Status</Eyebrow>
      <PageTitle>
        Are my sites <Accent>up?</Accent>
      </PageTitle>

      <p className="fx-rise mt-6 flex flex-wrap items-center gap-3 text-lg" style={{ animationDelay: "180ms" }}>
        <span className={`inline-flex items-center gap-2 font-bold ${allUp ? "text-teal" : "text-racing-text"}`}>
          <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${allUp ? "bg-teal" : "bg-racing"}`} />
          {error ? "My project list couldn't be loaded" : summary(checks)}
        </span>
        <span className="font-mono text-xs uppercase tracking-widest text-mist">
          Checked at {checkedAt} (South Africa) · every 5 minutes
        </span>
      </p>

      <ul className="mt-10 grid gap-4 md:grid-cols-2">
        {sites.map((p, i) => {
          const c = checks[i];
          const h = HEALTH[c.health];
          const slug = slugify(p.title);
          const scores = slug === "portfolio-v2-this-site" ? { ...about.lighthouse, checked: "" } : lighthouseScores[slug];
          return (
            <li key={p.id} className={`${card} fx-reveal flex flex-col gap-4 p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold uppercase">
                    <Link href={p.case_study_url || `/projects/${slug}`} className="hover:text-teal">
                      {p.title}
                    </Link>
                  </h2>
                  <a href={p.live_url as string} target="_blank" rel="noopener noreferrer" className="break-all font-mono text-xs text-mist hover:text-teal">
                    {shortUrl(p.live_url as string)}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </div>
                <p className={`flex shrink-0 items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest ${h.text}`}>
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${h.dot}`} />
                  {h.label}
                  {c.ms !== null && <span className="font-normal text-mist">{c.ms} ms</span>}
                </p>
              </div>
              <div className="mt-auto space-y-1.5 border-t border-line pt-3">
                {scores ? (
                  <>
                    <p aria-hidden="true" className="font-mono text-[10px] uppercase tracking-widest text-mist">
                      Performance · Accessibility · Best practices · SEO
                    </p>
                    <ScoreRow label="Phone" scores={scores.phone} />
                    <ScoreRow label="Laptop" scores={scores.laptop} />
                    {scores.checked && (
                      <p className="font-mono text-[11px] uppercase tracking-widest text-mist">
                        Measured {new Date(`${scores.checked}T12:00:00Z`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-mono text-xs uppercase tracking-widest text-mist">Lighthouse: not measured yet</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="fx-reveal mt-10 space-y-2 text-sm text-mist">
        <p>
          <strong className="text-snow">How it&apos;s checked:</strong> my server on Vercel asks each site for its home page, all at the same time, and
          times the answer (from Vercel's data centre, so it isn't the same as loading it in South Africa). Slower than {SLOW_MS / 1000} seconds counts as slow. No answer, or an error, counts as down.
        </p>
        <p>
          <strong className="text-snow">Lighthouse scores</strong> are Performance, Accessibility, Best practices and SEO, measured with PageSpeed
          Insights. Phone scores move a little between runs, because Lighthouse pretends to be a slower phone.{" "}
          <a href={about.lighthouse.proof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal hover:underline">
            My proof
            <Icon name="arrow-up-right" className="h-3 w-3" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </section>
  );
}
