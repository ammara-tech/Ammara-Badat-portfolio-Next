import Link from "next/link";
import Icon from "@/components/Icon";
import { journey, journeyDate } from "@/content/journey";

/*
  "My journey": a timeline on the About page, from my first repository to five live Firebase
  apps (content/journey.ts). The big steps have a larger red dot. It's an ordered list, so a
  screen reader reads it in order, and each step's date is a real <time>.
*/
export default function Journey() {
  return (
    <ol className="relative mt-8 space-y-6 border-l border-line-strong pl-7 sm:ml-2">
      {journey.map((step) => {
        const title = <span className="font-display text-lg font-bold uppercase leading-tight">{step.title}</span>;
        return (
          <li key={`${step.date}-${step.title}`} className="fx-reveal relative">
            <span
              aria-hidden="true"
              className={`absolute top-1.5 rounded-full ring-4 ring-ink ${
                step.milestone ? "-left-[2.1rem] h-3.5 w-3.5 bg-racing" : "-left-[1.95rem] h-2.5 w-2.5 bg-teal"
              }`}
            />
            <time dateTime={step.date} className="font-mono text-xs uppercase tracking-widest text-teal">
              {journeyDate(step.date)}
            </time>
            <p className="mt-0.5">
              {step.href ? (
                <Link href={step.href} className="group hover:text-teal">
                  {title}
                  <Icon name="arrow-right" className="ml-1.5 inline-block h-3.5 w-3.5 align-[-1px] opacity-60 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                title
              )}
            </p>
            <p className="mt-1 max-w-2xl leading-relaxed text-mist">{step.line}</p>
          </li>
        );
      })}
    </ol>
  );
}
