import { Accent, card } from "@/components/ui";
import type { AppStory as Story } from "@/content/app-stories";

/*
  "The thinking behind it": the problem, the decisions that mattered and what I'd do differently,
  for one of my apps. The words are in content/app-stories.ts. Shown on the project's page.
*/
export default function AppStory({ story }: { story: Story }) {
  return (
    <section aria-labelledby="story-title" className="mt-24">
      <h2 id="story-title" className="fx-reveal scroll-mt-24 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
        The thinking behind <Accent>it</Accent>
      </h2>

      <div className="fx-reveal mt-6 max-w-3xl">
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-teal">The problem</h3>
        <p className="mt-3 text-lg leading-relaxed text-mist">{story.problem}</p>
      </div>

      <h3 className="fx-reveal mt-10 font-mono text-xs uppercase tracking-[0.18em] text-teal">Decisions that mattered</h3>
      <ol className="mt-4 grid gap-4 lg:grid-cols-3">
        {story.decisions.map((d, i) => (
          <li key={d.title} className={`${card} fx-reveal p-5`}>
            <span aria-hidden="true" className="font-mono text-xs text-racing">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4 className="mt-2 font-display text-lg font-black uppercase leading-tight">{d.title}</h4>
            <p className="mt-3 leading-relaxed text-mist">{d.text}</p>
          </li>
        ))}
      </ol>

      <div className={`${card} fx-reveal mt-6 p-6`}>
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-teal">What I&apos;d do differently, or next</h3>
        <ul className="mt-4 space-y-3">
          {story.different.map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed text-mist">
              <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
