import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Reads the two settings from Vercel. Throws a clear message if either is missing.
function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  if (!url.startsWith("https://")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must start with https://");
  }

  return { url, key };
}

// Used on the server (public pages). Never signed in, so it reads as a visitor.
export function publicClient(): SupabaseClient {
  const { url, key } = getConfig();
  return createClient(url, key, { auth: { persistSession: false } });
}

// Used in the browser (admin page). Remembers who is signed in.
let browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { url, key } = getConfig();
    browserClient = createClient(url, key);
  }
  return browserClient;
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