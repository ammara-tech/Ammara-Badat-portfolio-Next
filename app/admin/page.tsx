"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { getBrowserClient, type Project } from "@/lib/supabase";

type FormState = {
  title: string;
  summary: string;
  live_url: string;
  repo_url: string;
  image_url: string;
  tags: string;
  sort_order: string;
};

const emptyForm: FormState = {
  title: "",
  summary: "",
  live_url: "",
  repo_url: "",
  image_url: "",
  tags: "",
  sort_order: "0",
};

const inputClass =
  "w-full rounded border border-white/15 bg-neutral-900 px-3 py-2 text-neutral-100 focus:border-emerald-400 focus:outline-none";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (checking) return <p className="text-neutral-400">Loading…</p>;
  if (!session) return <SignIn />;
  return <Dashboard email={session.user.email ?? ""} />;
}

/* ---------- Sign-in form (shown when nobody is signed in) ---------- */

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error } = await getBrowserClient().auth.signInWithPassword({ email, password });
    if (error) setError(error.message);

    setBusy(false);
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="text-3xl font-bold">Admin sign in</h1>
      <p className="mt-2 text-neutral-400">This area is for the site owner only.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm text-neutral-300">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-300">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-emerald-500 px-4 py-2 font-medium text-neutral-950 disabled:opacity-50"
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const loadProjects = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) setMessage({ type: "error", text: error.message });
    else setProjects((data ?? []) as Project[]);
  }, [supabase]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      summary: project.summary ?? "",
      live_url: project.live_url ?? "",
      repo_url: project.repo_url ?? "",
      image_url: project.image_url ?? "",
      tags: project.tags.join(", "),
      sort_order: String(project.sort_order),
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
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
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      sort_order: Number(form.sort_order) || 0,
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
      setMessage({ type: "ok", text: editingId ? "Project updated." : "Project added." });
      setEditingId(null);
      setForm(emptyForm);
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
    await supabase.auth.signOut();
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="mt-1 text-sm text-neutral-400">Signed in as {email}</p>
        </div>
        <button onClick={handleSignOut} className="rounded border border-white/20 px-4 py-2 text-sm">
          Sign out
        </button>
      </div>

      {message && (
        <p
          className={`mt-6 rounded border p-3 text-sm ${
            message.type === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Add / edit form */}
      <form onSubmit={handleSave} className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-xl font-semibold">{editingId ? "Edit project" : "Add a project"}</h2>

        <label className="block">
          <span className="text-sm text-neutral-300">Title *</span>
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <label className="block">
          <span className="text-sm text-neutral-300">Summary</span>
          <textarea
            rows={3}
            value={form.summary}
            onChange={(e) => updateField("summary", e.target.value)}
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm text-neutral-300">Live site URL</span>
            <input
              type="url"
              value={form.live_url}
              onChange={(e) => updateField("live_url", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block">
            <span className="text-sm text-neutral-300">GitHub URL</span>
            <input
              type="url"
              value={form.repo_url}
              onChange={(e) => updateField("repo_url", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-neutral-300">Image URL</span>
          <input
            value={form.image_url}
            onChange={(e) => updateField("image_url", e.target.value)}
            placeholder="https://… or /projects/myflix.png"
            className={`mt-1 ${inputClass}`}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-[1fr_8rem]">
          <label className="block">
            <span className="text-sm text-neutral-300">Tags (comma separated)</span>
            <input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="JavaScript, HTML, CSS"
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block">
            <span className="text-sm text-neutral-300">Order</span>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-emerald-500 px-4 py-2 font-medium text-neutral-950 disabled:opacity-50"
          >
            {busy ? "Saving…" : editingId ? "Save changes" : "Add project"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="rounded border border-white/20 px-4 py-2">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Project list */}
      <h2 className="mt-10 text-xl font-semibold">Projects ({projects.length})</h2>
      <ul className="mt-4 space-y-3">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-4"
          >
            <div>
              <p className="font-medium">
                <span className="mr-2 text-neutral-500">{project.sort_order}.</span>
                {project.title}
              </p>
              {project.summary && <p className="mt-1 text-sm text-neutral-400">{project.summary}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(project)}
                className="rounded border border-white/20 px-3 py-1 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(project)}
                className="rounded border border-red-500/40 px-3 py-1 text-sm text-red-300"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}