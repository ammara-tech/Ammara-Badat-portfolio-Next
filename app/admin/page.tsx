"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserClient, type Project } from "@/lib/supabase";
import { ADMIN_AUTH_KEY, LEFT_AT_KEY, leftTooLongAgo, tabStorage } from "@/lib/admin-session";
import { nextStep } from "@/lib/two-step";
import { TwoStepCode, TwoStepSetup } from "@/components/TwoStep";
import Inbox from "@/components/Inbox";
import AdminOverview from "@/components/AdminOverview";
import ImageUpload from "@/components/ImageUpload";
import ProjectOrderList from "@/components/ProjectOrderList";
import ActivityLog from "@/components/ActivityLog";
import IdleSignOut, { IDLE_FLAG } from "@/components/IdleSignOut";
import { ProjectCard } from "@/components/ProjectGrid";
import UnsavedChangesGuard, { DISCARD_MESSAGE } from "@/components/UnsavedChangesGuard";
import { changedFields } from "@/lib/unsaved";

type FormState = {
  title: string;
  summary: string;
  live_url: string;
  repo_url: string;
  image_url: string;
  video_url: string;
  case_study_url: string;
  tags: string;
  sort_order: string;
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  summary: "",
  live_url: "",
  repo_url: "",
  image_url: "",
  video_url: "",
  case_study_url: "",
  tags: "",
  sort_order: "0",
  published: true,
};

/** Splits "JavaScript, HTML, CSS" into a clean list of tags */
const parseTags = (text: string) =>
  text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const inputClass =
  "w-full rounded border border-line-strong bg-ink px-3 py-2 text-snow focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal";

/*
  /admin always starts on the sign-in form. The dashboard only appears once Supabase
  confirms a sign-in made in THIS tab (lib/admin-session.ts) AND the two-step code
  from my authenticator app has been entered (components/TwoStep.tsx). Nothing from
  the dashboard is in the page's HTML, and its data only loads for my account (RLS).
*/
export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  // After the password: ask for the authenticator code, set the app up, or show the dashboard
  const [step, setStep] = useState<"code" | "setup" | "dashboard" | null>(null);
  // Only true while a tab that was already signed in is being refreshed: shows a blank
  // area for a moment instead of flashing the sign-in form
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    const storage = tabStorage();
    const signOutHere = () => supabase.auth.signOut({ scope: "local" });

    // Sign-in events are ignored until the checks below are done, so a reopened tab
    // can never show the dashboard, not even for a moment
    let ready = false;

    // Was this tab closed (or left) and brought back later? Then sign out.
    async function check() {
      ready = false;
      const leftAt = Number(storage.getItem(LEFT_AT_KEY)) || null;
      storage.removeItem(LEFT_AT_KEY);
      if (leftTooLongAgo(leftAt, Date.now())) await signOutHere();
      if (!storage.getItem(ADMIN_AUTH_KEY)) {
        await decide(null); // not signed in here: the sign-in form
        ready = true;
        return;
      }
      setChecking(true);
      const { data } = await supabase.auth.getSession();
      await decide(data.session);
      setChecking(false);
      ready = true;
    }

    // Works out which step comes next for this sign-in
    async function decide(newSession: Session | null) {
      if (!newSession) {
        setSession(null);
        setStep(null);
        return;
      }
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setStep(nextStep({ currentLevel: data?.currentLevel ?? null, nextLevel: data?.nextLevel ?? null }));
      setSession(newSession);
    }
    check();

    // Note the time the tab is closed, refreshed or left...
    const onHide = () => storage.setItem(LEFT_AT_KEY, String(Date.now()));
    // ...and if the browser brings the page back from its memory much later, sign out
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) check();
    };
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);

    // Signing in, entering the code and signing out all come through here.
    // setTimeout: Supabase asks for other Supabase calls to wait until this callback has finished.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (ready) setTimeout(() => decide(newSession), 0);
    });

    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
      data.subscription.unsubscribe();
    };
  }, []);

  if (checking) return <div className="min-h-[50vh]" aria-busy="true" />;
  if (!session || !step) return <SignIn />;
  if (step === "code") return <TwoStepCode />;
  if (step === "setup") return <TwoStepSetup />;
  return <Dashboard email={session.user.email ?? ""} />;
}

/* ---------- Sign-in form (shown when nobody is signed in) ---------- */

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // "Show password" button: lets me check what I typed. Hidden again when I press Sign in.
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Explain an automatic sign-out (components/IdleSignOut.tsx)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(IDLE_FLAG)) {
        sessionStorage.removeItem(IDLE_FLAG);
        setTimedOut(true);
      }
    } catch {
      // storage blocked: nothing to show
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setShowPassword(false);

    const { error } = await getBrowserClient().auth.signInWithPassword({ email, password });
    if (error) setError(error.message);

    setBusy(false);
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="font-display text-3xl font-black uppercase">Admin sign in</h1>
      <p className="mt-2 text-mist">This area is for the site owner only.</p>
      {timedOut && (
        <p role="status" className="mt-4 rounded border border-teal/40 bg-teal/10 p-3 text-sm text-snow">
          You were signed out after 30 minutes without activity, to keep the admin page safe.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm text-mist">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <div>
          <label htmlFor="admin-password" className="text-sm text-mist">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-20`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-controls="admin-password"
              className="absolute inset-y-0 right-0 px-3 font-mono text-xs uppercase tracking-widest text-mist hover:text-teal focus-visible:text-teal"
            >
              {showPassword ? "Hide" : "Show"}
              <span className="sr-only"> password</span>
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-racing-text">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-racing px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}

/* ---------- Dashboard (shown when signed in) ---------- */

function Dashboard({ email }: { email: string }) {
  const supabase = getBrowserClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  // What the form started with (empty, or the project being edited), to spot unsaved changes
  const [formStart, setFormStart] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // Bumped when messages change, so the overview cards reload
  const [statsKey, setStatsKey] = useState(0);
  // Bumped when projects change, so the activity log reloads (it is also live)
  const [activityKey, setActivityKey] = useState(0);

  const loadProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) setMessage({ type: "error", text: error.message });
    else setProjects((data ?? []) as Project[]);
    setActivityKey((k) => k + 1);
  }, [supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function updateField(field: Exclude<keyof FormState, "published">, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const unsaved = changedFields(form, formStart).length > 0;

  function startEdit(project: Project) {
    if (unsaved && !window.confirm(DISCARD_MESSAGE)) return;
    const loaded: FormState = {
      title: project.title,
      summary: project.summary ?? "",
      live_url: project.live_url ?? "",
      repo_url: project.repo_url ?? "",
      image_url: project.image_url ?? "",
      video_url: project.video_url ?? "",
      case_study_url: project.case_study_url ?? "",
      tags: project.tags.join(", "),
      sort_order: String(project.sort_order),
      published: project.published !== false,
    };
    setEditingId(project.id);
    setForm(loaded);
    setFormStart(loaded);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFormStart(emptyForm);
    setMessage(null);
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }

    setBusy(true);
    setMessage(null);

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || null,
      live_url: form.live_url.trim() || null,
      repo_url: form.repo_url.trim() || null,
      image_url: form.image_url.trim() || null,
      video_url: form.video_url.trim() || null,
      case_study_url: form.case_study_url.trim() || null,
      tags: parseTags(form.tags),
      sort_order: Number(form.sort_order) || 0,
      published: form.published,
    };

    const result = editingId
      ? await supabase.from("projects").update(payload).eq("id", editingId).select()
      : await supabase.from("projects").insert(payload).select();

    if (result.error) {
      setMessage({ type: "error", text: result.error.message });
    } else if (!result.data || result.data.length === 0) {
      // RLS blocks updates silently, so no rows back means "not allowed"
      setMessage({ type: "error", text: "Nothing was saved. You may not have permission." });
    } else {
      setMessage({
        type: "ok",
        text: `${editingId ? "Project updated" : "Project added"}${form.published ? "." : " as a draft. Only you can see it."}`,
      });
      setEditingId(null);
      setForm(emptyForm);
      setFormStart(emptyForm);
      await loadProjects();
    }

    setBusy(false);
  }

  async function handleDelete(project: Project) {
    if (!window.confirm(`Delete "${project.title}"? This can't be undone.`)) return;

    setMessage(null);
    const { data, error } = await supabase.from("projects").delete().eq("id", project.id).select();

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else if (!data || data.length === 0) {
      setMessage({ type: "error", text: "Nothing was deleted. You may not have permission." });
    } else {
      setMessage({ type: "ok", text: `Deleted "${project.title}".` });
      if (editingId === project.id) cancelEdit();
      await loadProjects();
    }
  }

  async function handleSignOut() {
    if (unsaved && !window.confirm(DISCARD_MESSAGE)) return;
    await supabase.auth.signOut();
  }

  // What the card will look like on the Projects page, built from the form as I type
  const preview: Project = {
    id: editingId ?? "preview",
    title: form.title.trim() || "Project title",
    summary: form.summary.trim() || null,
    live_url: form.live_url.trim() || null,
    repo_url: form.repo_url.trim() || null,
    image_url: form.image_url.trim() || null,
    video_url: form.video_url.trim() || null,
    case_study_url: form.case_study_url.trim() || null,
    tags: parseTags(form.tags),
    sort_order: Number(form.sort_order) || 0,
    published: form.published,
    created_at: new Date().toISOString(),
  };

  return (
    <section>
      {/* Signs me out after 30 minutes without activity */}
      <IdleSignOut />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black uppercase">Admin</h1>
          <p className="mt-1 text-sm text-mist">Signed in as {email}</p>
        </div>
        <button onClick={handleSignOut} className="rounded border border-line-strong px-4 py-2 text-sm">
          Sign out
        </button>
      </div>

      {message && (
        <p
          className={`mt-6 rounded border p-3 text-sm ${
            message.type === "ok"
              ? "border-teal/40 bg-teal/10 text-teal"
              : "border-racing/40 bg-racing/10 text-snow"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Totals at a glance */}
      <AdminOverview projects={projects} refreshKey={statsKey} />

      {/* Contact form messages (owner only) */}
      <Inbox onChange={() => setStatsKey((k) => k + 1)} />

      {/* Add / edit form */}
      <UnsavedChangesGuard dirty={unsaved} />
      <form onSubmit={handleSave} className="mt-8 space-y-4 rounded-xl border border-line bg-panel p-5">
        <h2 className="text-xl font-semibold">{editingId ? "Edit project" : "Add a project"}</h2>

        <label className="block">
          <span className="text-sm text-mist">Title *</span>
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <label className="block">
          <span className="text-sm text-mist">Summary</span>
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-mist">Live site URL</span>
            <input
              type="url"
              value={form.live_url}
              onChange={(e) => updateField("live_url", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block">
            <span className="text-sm text-mist">GitHub URL</span>
            <input
              type="url"
              value={form.repo_url}
              onChange={(e) => updateField("repo_url", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm text-mist">Project image</legend>
          <ImageUpload value={form.image_url} onChange={(url) => updateField("image_url", url)} />
          <label className="block">
            <span className="text-sm text-mist">Image URL (filled in by the upload, or paste one)</span>
            <input
              value={form.image_url}
              onChange={(e) => updateField("image_url", e.target.value)}
              placeholder="https://… or /projects/myflix.png"
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-mist">Video URL (optional)</span>
            <input
              value={form.video_url}
              onChange={(e) => updateField("video_url", e.target.value)}
              placeholder="YouTube, Loom or Google Drive link"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block">
            <span className="text-sm text-mist">Case study page (optional)</span>
            <input
              value={form.case_study_url}
              onChange={(e) => updateField("case_study_url", e.target.value)}
              placeholder="/projects/nextjs-dashboard"
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_8rem]">
          <label className="block">
            <span className="text-sm text-mist">Tags (comma separated)</span>
            <input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="JavaScript, HTML, CSS"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block">
            <span className="text-sm text-mist">Order</span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-lg border border-line-strong p-3">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((current) => ({ ...current, published: e.target.checked }))}
            className="mt-1 h-4 w-4 accent-teal"
          />
          <span>
            <span className="block text-sm text-snow">Published</span>
            <span className="block text-sm text-mist">
              {form.published
                ? "Visitors can see this project on the Projects page."
                : "Draft: only you can see it. Visitors can't, even through the API (RLS)."}
            </span>
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-racing px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded border border-line-strong px-4 py-2">
              Cancel
            </button>
          )}
          {unsaved && <span className="self-center text-sm text-mist">Unsaved changes</span>}
        </div>
      </form>

      {/* Live preview: the real project card, built from the form above. "inert" stops its links
          from being clicked or focused, so I can't leave the page by accident. */}
      <section aria-labelledby="preview-title" className="mt-8">
        <h2 id="preview-title" className="flex flex-wrap items-center gap-3 text-xl font-semibold">
          Live preview
          {!form.published && (
            <span className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-mist">
              Draft
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-mist">How this project will look on the Projects page. It updates as you type.</p>
        <div inert className="mt-4 grid gap-6 md:grid-cols-2">
          <ProjectCard project={preview} first={false} />
        </div>
      </section>

      {/* Project list: drag to reorder (components/ProjectOrderList.tsx) */}
      <h2 className="mt-10 text-xl font-semibold">Projects ({projects.length})</h2>
      <ProjectOrderList projects={projects} onEdit={startEdit} onDelete={handleDelete} onSaved={loadProjects} />

      {/* Every change to a project, written by a database trigger (components/ActivityLog.tsx) */}
      <ActivityLog refreshKey={activityKey} />
    </section>
  );
}