/*
  Two-step sign-in for /admin (components/TwoStep.tsx).
  Supabase gives every sign-in an "assurance level":
    aal1 = password only
    aal2 = password + 6-digit code from my authenticator app
  The owner rules in the database need aal2 (Supabase/008-two-step-sign-in.sql).
  Tested in tests/admin.test.ts.
*/

export type Assurance = { currentLevel: string | null; nextLevel: string | null };

/** What the admin page should show after the password step */
export function nextStep({ currentLevel, nextLevel }: Assurance): "dashboard" | "code" | "setup" {
  if (currentLevel === "aal2") return "dashboard"; // both steps done
  if (nextLevel === "aal2") return "code"; // an authenticator app is set up: ask for its code
  return "setup"; // no authenticator app yet: set one up before going any further
}

/** Keeps only digits and at most 6 of them, so pasting "123 456" works */
export function cleanCode(input: string) {
  return input.replace(/\D/g, "").slice(0, 6);
}

/*
  Backup codes (components/BackupCodes.tsx, Supabase/010-backup-codes.sql).
  10 codes like 7KQM-3XPA, each usable once, for when my phone is lost.
  The database only keeps a hash of each code, so they can only be shown once.
*/

/** Letters and digits used in backup codes: no 0/O or 1/I/L, so they're hard to misread */
export const BACKUP_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Tidies a typed or pasted backup code as I type: capitals, no spaces, and a dash after
 * 4 characters, so "7kqm 3xpa" becomes "7KQM-3XPA".
 */
export function cleanBackupCode(input: string) {
  const chars = input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  return chars.length > 4 ? `${chars.slice(0, 4)}-${chars.slice(4)}` : chars;
}

/** True when a cleaned code has all 8 characters, all from the backup alphabet */
export function isCompleteBackupCode(code: string) {
  const chars = code.replace(/-/g, "");
  return chars.length === 8 && [...chars].every((c) => BACKUP_ALPHABET.includes(c));
}

/** The text file I can download and keep somewhere safe (not on my phone) */
export function backupCodesFile(codes: string[], site: string, madeOn: Date) {
  const date = madeOn.toISOString().slice(0, 10);
  return [
    `Backup codes for ${site}/admin`,
    `Made on ${date}. Each code works once. Making new codes stops these working.`,
    "",
    ...codes.map((code, i) => `${String(i + 1).padStart(2, " ")}. ${code}`),
    "",
    "Lost your phone? Sign in with your password, choose \"Use a backup code\",",
    "enter one of these, then set up your new phone.",
    "",
  ].join("\n");
}

/** What the dashboard says about how many codes are left (null: the SQL hasn't been run) */
export function codesLeftMessage(left: number | null): { tone: "ok" | "warn"; text: string } {
  if (left === null) return { tone: "warn", text: "Backup codes aren't set up yet." };
  if (left === 0) return { tone: "warn", text: "You have no backup codes. If you lose your phone, you'd be locked out of this page." };
  if (left <= 3) return { tone: "warn", text: `Only ${left} backup ${left === 1 ? "code" : "codes"} left. Make new ones soon.` };
  return { tone: "ok", text: `${left} of 10 backup codes left.` };
}
