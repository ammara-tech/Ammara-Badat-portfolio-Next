import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { publicClient } from "@/lib/supabase";
import { checkContact } from "@/lib/contact";

/*
  POST /api/contact — saves a contact form message to Supabase.

  Spam protection:
  1. Honeypot: a hidden "website" field people never see. Bots fill it in.
  2. Speed check: real people take more than 3 seconds to fill in the form.
  3. Rate limit: enforced in the database (Supabase/004-messages-contact-form.sql),
     max 3 messages per email or per visitor every 10 minutes.
  Bots caught by 1 or 2 get a fake "sent" reply, so they don't learn what gave them away.
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

  // Spam layers 1 and 2 and the field checks live in lib/contact.ts
  const check = checkContact(body);
  // Bots get a fake "sent" reply, so they don't learn what gave them away
  if (check.kind === "bot") return NextResponse.json({ ok: true });
  if (check.kind === "invalid") return fail(400, check.error);
  const { name, email, message } = check;

  // Store a one-way hash of the IP for the rate limit, never the IP itself
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  const ip_hash = ip ? createHash("sha256").update(`portfolio-contact:${ip}`).digest("hex") : null;

  try {
    const { error } = await publicClient().from("messages").insert({ name, email, message, ip_hash });

    if (error) {
      // P0001 = the rate limit in the database said no
      if (error.code === "P0001") return fail(429, error.message);
      return fail(500, "Your message couldn't be sent. Please email me instead.");
    }
  } catch {
    return fail(500, "Your message couldn't be sent. Please email me instead.");
  }

  return NextResponse.json({ ok: true });
}
