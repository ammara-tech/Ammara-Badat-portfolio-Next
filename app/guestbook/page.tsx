import type { Metadata } from "next";
import GuestbookForm from "@/components/GuestbookForm";
import JsonLd from "@/components/JsonLd";
import { Accent, Eyebrow, PageTitle, card } from "@/components/ui";
import { formatDate } from "@/content/notes";
import type { GuestbookEntry } from "@/lib/guestbook";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import { publicClient } from "@/lib/supabase";

/*
  /guestbook: visitors leave a short message, and it shows here once I've approved it in /admin.
  The page reads as a visitor, so the database only gives it approved entries, and only their
  name, message and date (never the hashed IP): see Supabase/011-guestbook.sql.
*/

export const metadata: Metadata = pageMetadata({
  title: "Guestbook — Ammara Badat",
  description: "Leave a message for Ammara Badat, junior full stack developer, and read what other visitors said.",
  path: "/guestbook",
});

// Rebuilt at most once a minute, so an entry I approve shows within a minute
export const revalidate = 60;

async function approvedEntries(): Promise<GuestbookEntry[] | null> {
  try {
    const { data, error } = await publicClient()
      .from("guestbook")
      .select("id, name, message, approved, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false })
      .limit(50);
    return error ? null : ((data ?? []) as GuestbookEntry[]);
  } catch {
    return null;
  }
}

export default async function Guestbook() {
  const entries = await approvedEntries();
  return (
    <section>
      <JsonLd data={[breadcrumbs([{ name: "Guestbook", path: "/guestbook" }])]} />
      <Eyebrow>Guestbook</Eyebrow>
      <PageTitle>
        Say <Accent>hello</Accent>
      </PageTitle>
      <p className="fx-rise mt-5 max-w-xl text-lg text-mist" style={{ animationDelay: "180ms" }}>
        Thanks for visiting. Leave a note: what you liked, where you&apos;re visiting from, or just hello.
      </p>

      <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="fx-rise" style={{ animationDelay: "240ms" }}>
          <GuestbookForm />
        </div>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-teal">
            {entries === null ? "Messages" : `${entries.length} message${entries.length === 1 ? "" : "s"}`}
          </h2>
          {entries === null ? (
            <p className="mt-4 text-mist">The messages couldn&apos;t be loaded right now. Please try again later.</p>
          ) : entries.length === 0 ? (
            <p className={`${card} mt-4 p-6 text-mist`}>No messages yet. Be the first to sign!</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {entries.map((e) => (
                <li key={e.id} className={`${card} fx-reveal p-5`}>
                  <p className="whitespace-pre-line leading-relaxed text-snow">{e.message}</p>
                  <p className="mt-3 font-mono text-xs uppercase tracking-widest text-mist">
                    {e.name} · <time dateTime={e.created_at}>{formatDate(e.created_at.slice(0, 10))}</time>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
