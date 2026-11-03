import Icon from "@/components/Icon";
import { about } from "@/content/about";

/*
  The Lighthouse badge in the footer: my latest scores for the Home page, one row for a
  phone and one for a laptop, linked to the screenshots in the README that prove them.
  The numbers live in content/about.ts. Phone Performance moves a little between runs,
  so its hover text gives the range I usually see.
*/

type Scores = { performance: number; accessibility: number; bestPractices: number; seo: number };

const names = ["Performance", "Accessibility", "Best practices", "SEO"];

/** "Performance 96, Accessibility 100, Best practices 100, SEO 100", for screen readers */
export function scoreWords(s: Scores) {
  return [s.performance, s.accessibility, s.bestPractices, s.seo].map((n, i) => `${names[i]} ${n}`).join(", ");
}

export default function LighthouseBadge() {
  const lh = about.lighthouse;
  const rows: [string, Scores][] = [
    ["Phone", lh.phone],
    ["Laptop", lh.laptop],
  ];

  return (
    <a
      href={lh.proof}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Google Lighthouse scores. On a phone: ${scoreWords(lh.phone)}. On a laptop: ${scoreWords(lh.laptop)}. Opens the proof on GitHub.`}
      className="group order-last flex items-center gap-3 rounded-2xl border border-line-strong px-3 py-2 transition hover:border-teal sm:order-none sm:w-auto"
    >
      <Icon name="sparkles" className="h-4 w-4 shrink-0 text-teal" />
      <span className="font-mono text-[11px] uppercase tracking-widest text-mist group-hover:text-snow">Lighthouse</span>
      <span className="flex flex-col gap-1.5" aria-hidden="true">
        {rows.map(([device, s]) => (
          <span key={device} className="flex items-center gap-1.5">
            <span className="w-12 font-mono text-[10px] uppercase tracking-wider text-mist">{device}</span>
            {[s.performance, s.accessibility, s.bestPractices, s.seo].map((score, i) => (
              <span
                key={names[i]}
                title={`${device}: ${names[i]}${device === "Phone" && i === 0 ? ` (${lh.phonePerformanceRange} from run to run)` : ""}`}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-teal font-mono text-[10px] font-bold text-teal"
              >
                {score}
              </span>
            ))}
          </span>
        ))}
      </span>
    </a>
  );
}
