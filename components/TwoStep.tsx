"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase";
import { cleanCode } from "@/lib/two-step";

/*
  The second step of signing in to /admin, after the password.

  TwoStepCode:  asks for the 6-digit code from my authenticator app
                (Google Authenticator, Microsoft Authenticator, Authy...).
  TwoStepSetup: shown once, when no app is set up yet. It shows a QR code to
                scan, then asks for the first code to prove it worked.

  Codes come from the app on my phone, not by email, and change every 30 seconds.
  Until this step is done the sign-in is only "aal1", and the database refuses
  every owner action (Supabase/008-two-step-sign-in.sql).
*/

const card = "mx-auto max-w-sm";
const inputClass =
  "mt-1 w-full rounded border border-line-strong bg-ink px-3 py-2 text-center font-mono text-2xl tracking-[0.4em] text-snow focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal";

// No maxLength: it would cut a pasted "123 456" short before the space is removed.
// cleanCode() keeps the box to 6 digits instead.
function CodeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm text-mist">6-digit code</span>
      <input
        value={value}
        onChange={(e) => onChange(cleanCode(e.target.value))}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        required
        autoFocus
        className={inputClass}
      />
    </label>
  );
}

function CancelLink() {
  return (
    <button
      type="button"
      onClick={() => getBrowserClient().auth.signOut({ scope: "local" })}
      className="mt-4 text-sm text-mist underline-offset-4 hover:text-teal hover:underline"
    >
      Cancel and sign out
    </button>
  );
}

/** Step 2 on every sign-in: the code from the app */
export function TwoStepCode() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = getBrowserClient();
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    const factor = data?.totp[0];
    if (listError || !factor) {
      setError(listError?.message ?? "No authenticator app found for this account.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    // On success Supabase upgrades the sign-in to aal2 and the admin page moves on by itself
    if (error) {
      setError("That code didn't work. Check the time on your phone is correct and try the newest code.");
      setCode("");
    }
    setBusy(false);
  }

  return (
    <section className={card}>
      <h1 className="font-display text-3xl font-black uppercase">Two-step sign in</h1>
      <p className="mt-2 text-mist">Open your authenticator app and enter the 6-digit code for this site.</p>
      <form onSubmit={verify} className="mt-8 space-y-4">
        <CodeInput value={code} onChange={setCode} />
        {error && (
          <p role="alert" className="text-sm text-racing-text">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="w-full rounded bg-racing px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {busy ? "Checking…" : "Verify"}
        </button>
      </form>
      <CancelLink />
    </section>
  );
}

/** Shown once: connect an authenticator app */
export function TwoStepSetup() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Start the set-up only once, even if React runs this effect twice while developing
    if (started.current) return;
    started.current = true;
    async function start() {
      const mfa = getBrowserClient().auth.mfa;
      // A set-up that was started but never finished blocks a new one, so remove it first
      const { data: list } = await mfa.listFactors();
      for (const f of list?.all ?? []) {
        if (f.factor_type === "totp" && f.status === "unverified") await mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await mfa.enroll({ factorType: "totp", friendlyName: "Portfolio admin" });
      if (error || !data) {
        setError(error?.message ?? "Couldn't start the set-up. Refresh the page to try again.");
        return;
      }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    }
    start();
  }, []);

  async function verify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setError(null);
    const { error } = await getBrowserClient().auth.mfa.challengeAndVerify({ factorId, code });
    if (error) {
      setError("That code didn't work. Make sure you scanned this QR code, then try the newest code.");
      setCode("");
    }
    setBusy(false);
  }

  return (
    <section className={card}>
      <h1 className="font-display text-3xl font-black uppercase">Set up two-step sign in</h1>
      <p className="mt-2 text-mist">
        For safety, the admin page needs a code from an authenticator app as well as your password. You only do this once.
      </p>

      <ol className="mt-6 space-y-3 text-sm text-mist">
        <li>
          <span className="font-mono text-teal">1.</span> Install an authenticator app on your phone, like Google
          Authenticator or Microsoft Authenticator.
        </li>
        <li>
          <span className="font-mono text-teal">2.</span> In the app, tap <strong className="text-snow">+</strong>, choose{" "}
          <strong className="text-snow">Other account</strong> and scan this QR code.
        </li>
      </ol>

      <div className="mt-4 flex justify-center rounded-xl bg-white p-4">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="QR code to scan with your authenticator app" width={180} height={180} />
        ) : (
          <div className="h-[180px] w-[180px] animate-pulse rounded bg-neutral-200" aria-label="Loading QR code" />
        )}
      </div>
      {secret && (
        <p className="mt-3 text-xs text-mist">
          Can&apos;t scan? Type this key into the app instead:{" "}
          <code className="block break-all rounded bg-ink p-2 font-mono text-snow">{secret}</code>
        </p>
      )}

      <form onSubmit={verify} className="mt-6 space-y-4">
        <p className="text-sm text-mist">
          <span className="font-mono text-teal">3.</span> Enter the 6-digit code the app shows for this site.
        </p>
        <CodeInput value={code} onChange={setCode} />
        {error && (
          <p role="alert" className="text-sm text-racing-text">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !factorId || code.length !== 6}
          className="w-full rounded bg-racing px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {busy ? "Checking…" : "Turn on two-step sign in"}
        </button>
      </form>
      <CancelLink />
    </section>
  );
}
