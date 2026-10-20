import Link from "next/link";
import Icon from "@/components/Icon";
import { Accent, btnGhost, btnIcon, btnPrimary } from "@/components/ui";

/* Shown for any page that doesn't exist */
export default function NotFound() {
  return (
    <section className="grid grid-cols-1 items-center gap-12 py-10 lg:grid-cols-2">
      <div>
        <p className="fx-rise font-mono text-xs uppercase tracking-[0.18em] text-teal">Error 404</p>
        <h1
          className="fx-rise mt-3 font-display text-6xl font-black uppercase leading-none tracking-tight sm:text-7xl"
          style={{ animationDelay: "100ms" }}
        >
          Off the <Accent>track.</Accent>
        </h1>
        <p className="fx-rise mt-5 max-w-md text-lg text-mist" style={{ animationDelay: "200ms" }}>
          This page doesn&apos;t exist, or it has moved. Let&apos;s get you back on course.
        </p>
        <div className="fx-rise mt-8 flex flex-wrap gap-4" style={{ animationDelay: "300ms" }}>
          <Link href="/" className={btnPrimary}>
            Back home
            <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
          </Link>
          <Link href="/projects" className={btnGhost}>
            See my projects
          </Link>
        </div>
      </div>

      <div className="fx-rise overflow-hidden rounded-xl border border-line-strong bg-panel" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center gap-2 border-b border-line bg-panel-alt px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-racing" />
          <span className="h-3 w-3 rounded-full bg-mist-dim" />
          <span className="h-3 w-3 rounded-full bg-teal" />
          <span className="ml-3 font-mono text-xs text-mist">not-found.ts</span>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-snow">
          <code>
            <span className="text-racing-text">const</span> page = <span className="text-teal">undefined</span>;{"\n"}
            {"\n"}
            <span className="text-racing-text">if</span> (!page) {"{"}
            {"\n"}
            {"  "}
            <span className="text-racing-text">return</span> <span className="text-teal">&quot;page not found&quot;</span>;{"\n"}
            {"}"}
            <span aria-hidden="true" className="fx-cursor ml-1 inline-block h-4 w-2 translate-y-0.5 bg-teal" />
          </code>
        </pre>
      </div>
    </section>
  );
}
