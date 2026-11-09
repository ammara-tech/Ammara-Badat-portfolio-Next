import Icon from "@/components/Icon";
import { card } from "@/components/ui";
import type { Architecture } from "@/content/architecture";

/*
  "How it works": a diagram on a project's page (content/architecture.ts).
  Three lanes, left to right (top to bottom on a phone), with a labelled arrow between each pair
  that says what travels there and whether it goes one way or both, then numbered steps that follow one action
  through the lanes. It's built from plain HTML boxes rather than a picture, so it fits any
  screen, follows light and dark mode, and a screen reader reads the boxes and steps as text.
*/
export default function HowItWorks({ architecture }: { architecture: Architecture }) {
  const { intro, lanes, arrows, steps } = architecture;
  return (
    <section aria-labelledby="how-title" className="mt-24">
      <h2 id="how-title" className="fx-reveal scroll-mt-24 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
        How it <span className="text-racing">works</span>
      </h2>
      <p className="fx-reveal mt-3 max-w-3xl text-lg leading-relaxed text-mist">{intro}</p>

      <div className="fx-reveal mt-8 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {lanes.map((lane, i) => (
          <div key={lane.title} className="contents">
            {i > 0 && (
              <div className="flex items-center justify-center gap-2 py-1 text-teal lg:w-28 lg:flex-col lg:gap-1.5 lg:py-0">
                <span aria-hidden="true" className="flex items-center gap-0.5 lg:flex-col">
                  <Icon name="chevron-down" className="h-5 w-5 lg:hidden" />
                  {arrows[i - 1].bothWays && <Icon name="chevron-up" className="h-5 w-5 lg:hidden" />}
                  <Icon name="arrow-right" className="hidden h-5 w-5 lg:block" />
                  {arrows[i - 1].bothWays && <Icon name="arrow-left" className="hidden h-5 w-5 lg:block" />}
                </span>
                <span className="text-center font-mono text-[10px] uppercase leading-snug tracking-widest">{arrows[i - 1].label}</span>
              </div>
            )}
            <div className={`${card} flex flex-col p-4`}>
              <h3 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-teal">
                <Icon name={lane.icon} className="h-4 w-4" />
                {lane.title}
              </h3>
              <ul className="mt-3 flex flex-1 flex-col gap-2">
                {lane.boxes.map((box) => (
                  <li key={box.title} className="rounded-lg border border-line-strong bg-ink/40 p-3">
                    <p className="font-display font-bold uppercase leading-tight">{box.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-mist">{box.line}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <ol className={`${card} fx-reveal mt-6 space-y-4 p-6`}>
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-teal/50 font-mono text-xs font-bold text-teal">
              {i + 1}
            </span>
            <p className="leading-relaxed text-mist">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
