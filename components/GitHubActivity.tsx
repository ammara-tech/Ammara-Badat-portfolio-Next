import Icon from "@/components/Icon";
import { Accent, Eyebrow, SmartLink, btnGhost } from "@/components/ui";

/*
  "Latest from GitHub": my most recently updated public repos, loaded live
  from the GitHub API on the server. The result is cached for an hour, so
  GitHub is asked at most once an hour however many people visit.
  If GitHub can't be reached, the section simply doesn't show.
*/

const USER = "ammara-tech";

export type Repo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
};

type User = { public_repos: number };

// The dot colours GitHub uses for each language
const languageColours: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  PLpgSQL: "#336790",
  Java: "#b07219",
  "C#": "#178600",
};

async function github<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        // Optional: a read-only token in Vercel raises the limit from 60 to 5,000 requests an hour
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function timeAgo(iso: string) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (days < 1) return "today";
  if (days < 30) return rtf.format(-days, "day");
  if (days < 365) return rtf.format(-Math.round(days / 30), "month");
  return rtf.format(-Math.round(days / 365), "year");
}

export default async function GitHubActivity() {
  const [repos, user] = await Promise.all([
    github<Repo[]>(`/users/${USER}/repos?sort=pushed&per_page=30&type=owner`),
    github<User>(`/users/${USER}`),
  ]);
  if (!repos) return null;

  const latest = repos.filter((r) => !r.fork && !r.archived && r.name !== USER).slice(0, 6);
  if (latest.length === 0) return null;

  return <GitHubRepos repos={latest} publicRepos={user?.public_repos ?? null} />;
}

/** The cards themselves (kept separate from the loading so it is easy to test) */
export function GitHubRepos({ repos: latest, publicRepos }: { repos: Repo[]; publicRepos: number | null }) {
  return (
    <section aria-labelledby="github-title" className="mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="fx-reveal">
          <Eyebrow>Live from GitHub</Eyebrow>
          <h2 id="github-title" className="font-display text-3xl font-black uppercase tracking-tight sm:text-4xl">
            What I&apos;m <Accent>working on</Accent>
          </h2>
          <p className="mt-3 text-mist">
            {publicRepos ? `${publicRepos} public repositories. ` : ""}Most recently updated first, refreshed every hour.
          </p>
        </div>
        <SmartLink href={`https://github.com/${USER}`} className={`${btnGhost} fx-reveal`}>
          <Icon name="github" className="h-4 w-4" />
          See all on GitHub
        </SmartLink>
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {latest.map((repo) => (
          <li key={repo.name}>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="spotlight fx-reveal group flex h-full flex-col rounded-xl border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-teal/50"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 font-mono text-sm font-bold text-snow group-hover:text-teal">
                  <Icon name="code" className="h-4 w-4 shrink-0 text-teal" />
                  <span className="truncate">{repo.name}</span>
                </span>
                <Icon name="arrow-up-right" className="h-4 w-4 shrink-0 text-mist transition group-hover:text-teal" />
              </span>
              <span className="mt-2 line-clamp-2 flex-1 text-sm text-mist">
                {repo.description ?? "No description yet."}
              </span>
              <span className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-mist">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: languageColours[repo.language] ?? "#9497a6" }}
                    />
                    {repo.language}
                  </span>
                )}
                {repo.stargazers_count > 0 && <span>★ {repo.stargazers_count}</span>}
                <span>Updated {timeAgo(repo.pushed_at)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
