import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Used in the browser (admin page). Remembers who is signed in.
export const supabase = createClient(url, key);

// Used on the server (public pages). Never signed in, so it reads as a visitor.
export function publicClient() {
  return createClient(url!, key!, { auth: { persistSession: false } });
}

export type Project = {
  id: string;
  title: string;
  summary: string | null;
  live_url: string | null;
  repo_url: string | null;
  image_url: string | null;
  tags: string[];
  sort_order: number;
  created_at: string;
};