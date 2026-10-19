import Link from "next/link";

export default function Home() {
  return (
    <section>
      <p className="text-sm text-emerald-400">Available for opportunities</p>
      <h1 className="mt-2 text-4xl font-bold">Building software end to end.</h1>
      <p className="mt-4 text-neutral-400">Junior Full Stack Developer. Placeholder intro.</p>
      <div className="mt-8 flex gap-4">
        <Link href="/projects" className="rounded bg-emerald-500 px-4 py-2 font-medium text-neutral-950">
          View Projects
        </Link>
        <Link href="/contact" className="rounded border border-white/20 px-4 py-2">
          Get In Touch
        </Link>
      </div>
    </section>
  );
}