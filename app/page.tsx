import Link from "next/link";
import { about } from "@/content/about";
import { Accent, Para, btnGhost, btnPrimary } from "@/components/ui";

export default function Home() {
  return (
    <section className="grid items-center gap-12 py-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-teal">
          <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-teal" />
          {about.status}
        </p>

        <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
          Building software <Accent>end to end.</Accent>
        </h1>

        <p className="mt-5 font-mono text-sm uppercase tracking-[0.18em] text-teal">{about.role}</p>

        <div className="mt-5 max-w-xl">
          <Para text={about.intro} className="text-lg leading-relaxed text-mist" />
        </div>

        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/projects" className={btnPrimary}>
            View projects →
          </Link>
          <Link href="/contact" className={btnGhost}>
            Get in touch
          </Link>
        </div>
      </div>

      {/* The code card from my first portfolio */}
      <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/40">
        <div className="flex items-center gap-2 border-b border-line bg-panel-alt px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-racing" />
          <span className="h-3 w-3 rounded-full bg-mist-dim" />
          <span className="h-3 w-3 rounded-full bg-teal" />
          <span className="ml-3 font-mono text-xs text-mist">developer.ts</span>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-snow">
          <code>
            <span className="text-racing">const</span> developer = {"{"}
            {"\n"}  name: <span className="text-teal">&quot;{about.name}&quot;</span>,
            {"\n"}  role: <span className="text-teal">&quot;{about.role}&quot;</span>,
            {"\n"}  stack: [<span className="text-teal">&quot;Next.js&quot;</span>,{" "}
            <span className="text-teal">&quot;TypeScript&quot;</span>,{" "}
            <span className="text-teal">&quot;Supabase&quot;</span>],
            {"\n"}  status: <span className="text-teal">&quot;open to work&quot;</span>,
            {"\n"}  <span className="text-mist">{"// see what I've built"}</span>
            {"\n"}  next: <span className="text-teal">&quot;/projects&quot;</span>,
            {"\n"}
            {"};"}
          </code>
        </pre>
      </div>
    </section>
  );
}
