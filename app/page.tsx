import type { Metadata } from "next";
import Link from "next/link";
import { about } from "@/content/about";
import { caseStudy } from "@/content/case-study";
import Icon from "@/components/Icon";
import Screenshot from "@/components/Screenshot";
import Terminal from "@/components/Terminal";
import GitHubActivity from "@/components/GitHubActivity";
import { pageMetadata } from "@/lib/seo";
import { Accent, Divider, Eyebrow, Para, SmartLink, btnGhost, btnIcon, btnPrimary } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  title: "Ammara Badat — Junior Full Stack Developer",
  description:
    "Portfolio of Ammara Badat, a junior full stack developer in Gauteng, South Africa, building secure web apps with Next.js, React and Supabase.",
  path: "/",
});

// Tech shown in the scrolling strip
const tech = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Supabase",
  "PostgreSQL",
  "Row Level Security",
  "HTML5",
  "CSS",
  "Vercel",
  "Git & GitHub",
];

export default function Home() {
  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative grid grid-cols-1 items-center gap-12 py-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0">
          <p className="fx-rise inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-teal">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
            </span>
            {about.status}
          </p>

          <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="fx-rise block" style={{ animationDelay: "120ms" }}>
              Building software
            </span>
            <span className="fx-rise relative inline-block" style={{ animationDelay: "260ms" }}>
              <Accent>end to end.</Accent>
              <span
                aria-hidden="true"
                className="fx-underline absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-linear-to-r from-racing to-teal"
              />
            </span>
          </h1>

          <p
            className="fx-rise mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm uppercase tracking-[0.18em] text-teal"
            style={{ animationDelay: "420ms" }}
          >
            {about.role}
            <span className="text-mist-dim">·</span>
            <span className="inline-flex items-center gap-1 text-mist">
              <Icon name="map-pin" className="h-4 w-4" />
              {about.location}
            </span>
          </p>

          <div className="fx-rise mt-5 max-w-xl" style={{ animationDelay: "520ms" }}>
            <Para text={about.intro} className="text-lg leading-relaxed text-mist" />
          </div>

          <div className="fx-rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: "640ms" }}>
            <Link href="/projects" className={btnPrimary}>
              View projects
              <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
            </Link>
            <Link href="/contact" className={btnGhost}>
              Get in touch
            </Link>
            <a href={about.contact.cv} download className={btnGhost}>
              <Icon name="download" className="h-4 w-4" />
              Download CV
            </a>
          </div>
        </div>

        {/* The code card from my first portfolio, now an interactive terminal */}
        <div className="fx-rise relative" style={{ animationDelay: "300ms" }}>
          <div
            aria-hidden="true"
            className="fx-glow absolute -inset-6 -z-10 rounded-[2rem] bg-linear-to-br from-racing/30 via-transparent to-teal/25 blur-3xl"
          />
          <Terminal />
        </div>
      </section>

      <Divider />

      {/* ---------- Tech strip ---------- */}
      <section aria-label="Tech I work with" className="fx-reveal">
        <p className="mb-5 text-center font-mono text-xs uppercase tracking-[0.18em] text-mist">Tech I work with</p>
        <div className="fx-marquee-wrap overflow-hidden">
          <ul className="fx-marquee flex w-max gap-3">
            {[...tech, ...tech].map((name, i) => (
              <li
                key={i}
                aria-hidden={i >= tech.length ? "true" : undefined}
                className="flex items-center gap-2 rounded-full border border-line-strong bg-panel/70 px-4 py-2 font-mono text-xs uppercase tracking-wider text-snow"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-racing" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Featured capstone ---------- */}
      <section className="mt-24">
        <div className="fx-reveal">
          <Eyebrow>Featured project</Eyebrow>
        </div>
        <Link
          href="/projects/nextjs-dashboard"
          className="spotlight spotlight-red fx-reveal group mt-2 grid items-center gap-8 overflow-hidden rounded-2xl border border-racing/40 bg-panel p-5 transition hover:border-racing hover:shadow-[0_0_60px_-15px_rgb(232_0_45/0.45)] sm:p-7 md:grid-cols-[1.15fr_1fr]"
        >
          <div className="overflow-hidden rounded-lg">
            <Screenshot
              src={caseStudy.screenshots[0]?.src ?? null}
              alt={caseStudy.screenshots[0]?.alt ?? caseStudy.title}
              sizes="(min-width: 1024px) 560px, (min-width: 768px) 55vw, 100vw"
              className="transition duration-700 group-hover:scale-[1.03]"
            />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">Capstone case study</p>
            <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
              {caseStudy.title}
            </h2>
            <p className="mt-4 leading-relaxed text-mist">{caseStudy.tagline}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {caseStudy.stack.slice(0, 4).map((item) => (
                <li
                  key={item.name}
                  className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-mist"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <span className={`${btnPrimary} mt-7`}>
              Read the case study
              <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
            </span>
          </div>
        </Link>
      </section>

      {/* ---------- Live GitHub repos ---------- */}
      <GitHubActivity />

      {/* ---------- Call to action ---------- */}
      <section className="fx-reveal mt-24 overflow-hidden rounded-2xl border border-line bg-linear-to-br from-panel to-panel-alt p-8 text-center sm:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">{about.status}</p>
        <h2 className="mt-3 font-display text-3xl font-black uppercase tracking-tight sm:text-5xl">
          Let&apos;s build something <Accent>together.</Accent>
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/contact" className={btnPrimary}>
            Get in touch
            <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
          </Link>
          <SmartLink href={about.contact.github} className={btnGhost}>
            <Icon name="github" className="h-4 w-4" />
            GitHub
          </SmartLink>
        </div>
      </section>
    </div>
  );
}
