import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_AUTH_KEY, tabStorage } from "@/lib/admin-session";

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

// Used in the browser (admin page). Remembers who is signed in, but only in this one tab:
// the sign-in is kept in sessionStorage, so it is gone when the tab or window closes
// (lib/admin-session.ts explains why).
let browserClient: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    const { url, key } = getConfig();
    browserClient = createClient(url, key, {
      auth: { storage: tabStorage(), storageKey: ADMIN_AUTH_KEY, persistSession: true },
    });
    // Older versions of my site saved the sign-in in localStorage, shared by every tab. Remove it.
    try {
      for (const k of Object.keys(localStorage)) if (/^sb-.+-auth-token$/.test(k)) localStorage.removeItem(k);
    } catch {
      // storage blocked: nothing was saved there anyway
    }
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
  video_url: string | null;
  case_study_url: string | null;
  tags: string[];
  sort_order: number;
  /** false = draft: only my account can see it (RLS, Supabase/007-drafts-activity-log.sql) */
  published: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

/** One row of the admin activity log, written by a database trigger */
export type ActivityEntry = {
  id: number;
  /** What the entry is about. Rows from before 009-activity-log-messages-images.sql have no kind: they are projects. */
  kind?: "project" | "message" | "image";
  action: "added" | "edited" | "published" | "unpublished" | "reordered" | "deleted" | "received" | "uploaded";
  project_id: string | null;
  project_title: string;
  details: string | null;
  created_at: string;
};
