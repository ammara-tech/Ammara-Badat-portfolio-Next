import Link from "next/link";
import type { Metadata } from "next";
import { caseStudy } from "@/content/case-study";
import Screenshot from "@/components/Screenshot";
import { Accent, Eyebrow, Para, SectionTitle, SmartLink, btnGhost, btnPrimary, card } from "@/components/ui";

export const metadata: Metadata = {
  title: `${caseStudy.title} — Case study — Ammara Badat`,
  description: "Capstone case study: the problem, my role, the stack, screenshots and what's next.",
};

// A video file in /public plays on the page; anything else (YouTube, Loom) is a link.
const isVideoFile = /\.(mp4|webm)$/i.test(caseStudy.videoUrl);

const sections = [
  ...(isVideoFile ? [{ id: "demo", label: "Demo video" }] : []),
  { id: "problem", label: "The problem" },
  { id: "role", label: "My role" },
  { id: "stack", label: "The stack" },
  { id: "built", label: "What I built" },
  { id: "screenshots", label: "Screenshots" },
  { id: "challenges", label: "Challenges" },
  { id: "next", label: "What's next" },
];

export default function CaseStudy() {
  const cs = caseStudy;
  const [heroShot, ...otherShots] = cs.screenshots;

  return (
    <article>
      <Link href="/projects" className="font-mono text-xs uppercase tracking-widest text-mist hover:text-teal">
        ← All projects
      </Link>

      {/* Header */}
      <header className="mt-8">
        <Eyebrow>Capstone case study</Eyebrow>
        <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
          {cs.title.split(" ").slice(0, -1).join(" ")} <Accent>{cs.title.split(" ").slice(-1).join("")}</Accent>
        </h1>
        <div className="mt-5 max-w-2xl">
          <Para text={cs.tagline} className="text-xl leading-relaxed text-mist" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <SmartLink href={cs.liveUrl} className={btnPrimary}>
            Live site ↗
          </SmartLink>
          <SmartLink href={cs.repoUrl} className={btnGhost}>
            GitHub repo
          </SmartLink>
          {cs.videoUrl && (
            <SmartLink href={isVideoFile ? "#demo" : cs.videoUrl} className={btnGhost}>
              ▶ Watch the demo
            </SmartLink>
          )}
        </div>

        {/* Quick facts */}
        <dl className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className={`${card} p-5`}>
            <dt className="font-mono text-xs uppercase tracking-widest text-teal">When</dt>
            <dd className="mt-1 text-snow">
              {cs.year} · {cs.context}
            </dd>
          </div>
          <div className={`${card} p-5 sm:col-span-2`}>
            <dt className="font-mono text-xs uppercase tracking-widest text-teal">Built for</dt>
            <dd className="mt-1">
              <Para text={cs.audience} className="text-snow" />
            </dd>
          </div>
        </dl>
      </header>

      {heroShot && (
        <figure className="mt-12">
          <Screenshot src={heroShot.src} alt={heroShot.alt} />
          <figcaption className="mt-3 font-mono text-xs text-mist">{heroShot.caption}</figcaption>
        </figure>
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-[12rem_1fr]">
        {/* On this page */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-28 space-y-3 border-l border-line pl-4 font-mono text-xs uppercase tracking-widest">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-mist hover:text-teal">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-16">
          {isVideoFile && (
            <section>
              <SectionTitle id="demo">
                Demo <Accent>video</Accent>
              </SectionTitle>
              <figure className="mt-6">
                <video
                  controls
                  preload="metadata"
                  playsInline
                  poster={cs.videoPoster || undefined}
                  className="h-auto w-full rounded-lg border border-line bg-black"
                >
                  <source src={cs.videoUrl} type="video/mp4" />
                  Your browser can&apos;t play this video.{" "}
                  <a href={cs.videoUrl} className="text-teal underline">
                    Download it instead
                  </a>
                  .
                </video>
                {cs.videoCaption && (
                  <figcaption className="mt-3 font-mono text-xs text-mist">{cs.videoCaption}</figcaption>
                )}
              </figure>
            </section>
          )}

          <section>
            <SectionTitle id="problem">
              The <Accent>problem</Accent>
            </SectionTitle>
            <div className="mt-5">
              <Para text={cs.problem} className="text-lg leading-relaxed text-mist" />
            </div>
          </section>

          <section>
            <SectionTitle id="role">
              My <Accent>role</Accent>
            </SectionTitle>
            <div className="mt-5">
              <Para text={cs.role} className="text-lg leading-relaxed text-mist" />
            </div>
          </section>

          <section>
            <SectionTitle id="stack">
              The <Accent>stack</Accent>
            </SectionTitle>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {cs.stack.map((item) => (
                <li key={item.name} className={`${card} p-4`}>
                  <p className="font-mono text-sm font-bold text-teal">{item.name}</p>
                  <p className="mt-1 text-sm text-mist">{item.use}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle id="built">
              What I <Accent>built</Accent>
            </SectionTitle>
            <ul className="mt-6 space-y-3">
              {cs.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-mist">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-racing" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle id="screenshots">
              <Accent>Screenshots</Accent>
            </SectionTitle>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {otherShots.map((shot) => (
                <figure key={shot.src}>
                  <Screenshot src={shot.src} alt={shot.alt} />
                  <figcaption className="mt-2 font-mono text-xs text-mist">{shot.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle id="challenges">
              Challenges & <Accent>lessons</Accent>
            </SectionTitle>
            <div className="mt-5 space-y-5">
              <Para text={cs.challenges} className="text-lg leading-relaxed text-mist" />
              <Para text={cs.learned} className="text-lg leading-relaxed text-mist" />
            </div>
          </section>

          <section>
            <SectionTitle id="next">
              What I&apos;d do <Accent>next</Accent>
            </SectionTitle>
            <ul className="mt-6 space-y-3">
              {cs.next.map((item) =>
                item.startsWith("TODO") ? (
                  <li key={item}>
                    <Para text={item} />
                  </li>
                ) : (
                  <li key={item} className="flex gap-3 text-mist">
                    <span aria-hidden="true" className="font-mono text-teal">
                      →
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </section>

          <div className={`${card} flex flex-wrap items-center justify-between gap-4 p-6`}>
            <p className="font-display text-xl font-black uppercase">See it for yourself</p>
            <div className="flex flex-wrap gap-3">
              <SmartLink href={cs.liveUrl} className={btnPrimary}>
                Live site ↗
              </SmartLink>
              <SmartLink href={cs.repoUrl} className={btnGhost}>
                GitHub repo
              </SmartLink>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
