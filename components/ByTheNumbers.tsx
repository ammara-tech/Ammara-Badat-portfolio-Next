import CountUp from "@/components/CountUp";
import { card } from "@/components/ui";
import { about } from "@/content/about";
import { certificationGroups } from "@/content/certifications";
import { notes } from "@/content/notes";
import { recruiters } from "@/content/recruiters";
import { byTheNumbers } from "@/lib/numbers";
import { countProjects } from "@/lib/projects";

/*
  "By the numbers" on the Home page: five numbers counted from real data (lib/numbers.ts),
  that count up when they scroll into view (CountUp.tsx; reduced motion shows them straight away).
*/
export default async function ByTheNumbers() {
  const stats = byTheNumbers({
    projects: await countProjects(),
    liveApps: recruiters.liveApps,
    notes: notes.length,
    certificates: certificationGroups.reduce((n, g) => n + g.certificates.length, 0),
    accessibility: about.lighthouse.phone.accessibility,
  });

  return (
    <section aria-labelledby="numbers-title" className="mt-24">
      <h2 id="numbers-title" className="fx-reveal text-center font-mono text-xs uppercase tracking-[0.18em] text-mist">
        By the numbers
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <li
            key={s.label}
            className={`${card} spotlight fx-reveal group relative overflow-hidden p-5 text-center transition hover:border-teal/50 ${i === stats.length - 1 && stats.length % 2 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-racing to-teal transition-transform duration-500 group-hover:scale-x-100"
            />
            <p className="font-display text-4xl font-black text-snow">
              <CountUp value={s.value} />
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-mist">{s.label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
