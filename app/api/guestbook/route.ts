import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { publicClient } from "@/lib/supabase";
import { checkEntry } from "@/lib/guestbook";

/*
  POST /api/guestbook — saves a guestbook entry to Supabase, waiting for my approval.

  Spam protection:
  1. Honeypot: a hidden "website" field people never see. Bots fill it in.
  2. Speed check: real people take more than 3 seconds.
  3. No links in the name or message (lib/guestbook.ts).
  4. Rate limit, in the database (Supabase/011-guestbook.sql): 2 entries per visitor every
     10 minutes, and 20 an hour in total.
  And nothing shows on the site until I approve it in /admin (the database makes every new
  entry "waiting", whatever is sent).
*/

function fail(status: number, error: string) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Something went wrong. Please try again.");
  }
  if (!body || typeof body !== "object") return fail(400, "Something went wrong. Please try again.");

  const check = checkEntry(body);
  if (check.kind === "bot") return NextResponse.json({ ok: true }); // bots don't learn what gave them away
  if (check.kind === "invalid") return fail(400, check.error);

  // A one-way hash of the IP for the rate limit, never the IP itself
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const ip_hash = ip ? createHash("sha256").update(`portfolio-guestbook:${ip}`).digest("hex") : null;

  try {
    const { error } = await publicClient().from("guestbook").insert({ name: check.name, message: check.message, ip_hash });
    if (error) {
      if (error.code === "P0001") return fail(429, error.message); // the database's rate limit
      return fail(500, "Your message couldn't be saved. Please try again later.");
    }
  } catch {
    return fail(500, "Your message couldn't be saved. Please try again later.");
  }
  return NextResponse.json({ ok: true });
}
