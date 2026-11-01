"use client";

import { useCallback, useEffect, useState } from "react";
import { getBrowserClient } from "@/lib/supabase";
import { copyText } from "@/lib/clipboard";
import { siteUrl } from "@/lib/site";
import { backupCodesFile, codesLeftMessage } from "@/lib/two-step";
import Icon from "@/components/Icon";

/*
  "Backup codes" on /admin: 10 one-time codes for when my phone is lost.

  The codes are made inside the database (make_backup_codes in Supabase/010-backup-codes.sql),
  which keeps only a hash of each one, so this is the only time they can be seen.
  I copy or download them and keep them somewhere safe that isn't my phone.
  Using one is on the two-step sign-in screen (components/TwoStep.tsx).
*/

const button =
  "flex items-center gap-1.5 rounded border border-line-strong px-3 py-1 text-sm hover:border-teal hover:text-teal disabled:opacity-40";

export default function BackupCodes() {
  const supabase = getBrowserClient();
  const [left, setLeft] = useState<number | null>(null);
  const [setUp, setSetUp] = useState(true); // false until Supabase/010-backup-codes.sql has been run
  const [codes, setCodes] = useState<string[] | null>(null); // only while they're on screen
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("backup_codes_left");
    if (error) {
      // "Could not find the function ..." means the SQL file hasn't been run yet
      const missing = /could not find the function|backup_codes_left/i.test(error.message);
      setSetUp(!missing);
      if (!missing) setError(error.message);
      setLeft(null);
      return;
    }
    setSetUp(true);
    setLeft(typeof data === "number" ? data : null);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function make() {
    if (left && !window.confirm("Make new backup codes? Your current codes will stop working.")) return;
    setBusy(true);
    setError(null);
    setNote(null);
    const { data, error } = await supabase.rpc("make_backup_codes");
    setBusy(false);
    if (error || !Array.isArray(data)) {
      setError(error?.message ?? "Couldn't make the codes. Try again.");
      return;
    }
    setCodes(data as string[]);
    load();
  }

  async function copyAll() {
    if (!codes) return;
    setNote((await copyText(codes.join("\n"))) ? "Copied." : "Couldn't copy. Select the codes and copy them yourself.");
  }

  function download() {
    if (!codes) return;
    const host = siteUrl.replace(/^https?:\/\//, "");
    const url = URL.createObjectURL(new Blob([backupCodesFile(codes, host, new Date())], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-backup-codes.txt";
    link.click();
    URL.revokeObjectURL(url);
    setNote("Downloaded. Keep the file somewhere safe that isn't your phone.");
  }

  const status = codesLeftMessage(setUp ? left : null);

  return (
    <section className="mt-10 rounded-xl border border-line bg-panel p-5" aria-labelledby="backup-title">
      <h2 id="backup-title" className="flex items-center gap-2 text-xl font-semibold">
        <Icon name="badge" className="h-5 w-5 text-teal" />
        Backup codes
      </h2>
      <p className="mt-1 text-sm text-mist">
        If you lose your phone, one of these codes gets you back in and lets you set up a new authenticator app. Each
        code works once.
      </p>

      {!setUp ? (
        <p className="mt-4 rounded border border-racing/40 bg-racing/10 p-3 text-sm">
          Run <code className="font-mono">Supabase/010-backup-codes.sql</code> in the Supabase SQL Editor to switch this
          on.
        </p>
      ) : (
        <p className={`mt-4 text-sm ${status.tone === "warn" ? "text-racing-text" : "text-teal"}`} role="status">
          {left === null ? "Checking…" : status.text}
        </p>
      )}

      {codes ? (
        <div className="mt-4 rounded-lg border border-teal/40 bg-ink p-4">
          <p className="text-sm font-medium">Save these now. You won&apos;t be able to see them again.</p>
          <ol className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-lg text-snow sm:grid-cols-5">
            {codes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={download} className={button}>
              <Icon name="download" className="h-4 w-4" />
              Download .txt
            </button>
            <button type="button" onClick={copyAll} className={button}>
              <Icon name="copy" className="h-4 w-4" />
              Copy all
            </button>
            <button type="button" onClick={() => setCodes(null)} className={button}>
              <Icon name="check" className="h-4 w-4" />
              I&apos;ve saved them
            </button>
          </div>
          {note && (
            <p className="mt-3 text-sm text-mist" role="status">
              {note}
            </p>
          )}
        </div>
      ) : (
        setUp && (
          <button type="button" onClick={make} disabled={busy || left === null} className={`mt-4 ${button}`}>
            <Icon name="refresh" className="h-4 w-4" />
            {busy ? "Making codes…" : left ? "Make new codes" : "Make backup codes"}
          </button>
        )
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-racing-text">
          {error}
        </p>
      )}
    </section>
  );
}
