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
