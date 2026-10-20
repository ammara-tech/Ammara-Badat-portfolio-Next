import Link from "next/link";

/* Shared building blocks so every page uses the same v1 look. */

export const btnPrimary =
  "inline-flex items-center gap-2 rounded bg-racing px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-snow transition hover:-translate-y-0.5 hover:bg-racing/90";

export const btnGhost =
  "inline-flex items-center gap-2 rounded border border-line-strong px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-snow transition hover:-translate-y-0.5 hover:border-teal hover:text-teal";

export const card = "rounded-xl border border-line bg-panel";

/** Small uppercase label with the red line in front, like v1's ".eyebrow" */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-teal">
      <span aria-hidden="true" className="inline-block h-0.5 w-5 bg-racing" />
      {children}
    </p>
  );
}

/** Big uppercase page heading. Wrap a word in <Accent> to make it red. */
export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
      {children}
    </h1>
  );
}

export function SectionTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
      {children}
    </h2>
  );
}

export function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-racing">{children}</span>;
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-full border border-line-strong px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-mist">
      {children}
    </li>
  );
}

/**
 * Renders a paragraph of my own writing.
 * Any text that still starts with "TODO" shows as a dashed red box,
 * so I can see straight away what I haven't written yet.
 */
export function Para({ text, className = "text-mist leading-relaxed" }: { text: string; className?: string }) {
  if (text.startsWith("TODO")) {
    return (
      <p className="rounded-lg border border-dashed border-racing/60 bg-racing/10 p-4 font-mono text-sm text-snow/80">
        ✍️ {text}
      </p>
    );
  }
  return <p className={className}>{text}</p>;
}

/** Opens external links in a new tab, internal links with Next.js routing */
export function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
