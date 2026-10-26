/*
  /api/version tells you which commit the live site was built from, e.g. {"commit":"8714eea..."}.
  The Lighthouse GitHub Action checks it every 15 seconds after a push, and starts as soon as
  Vercel is serving that commit, instead of always waiting a fixed few minutes.
  The commit ID is already public on GitHub, so this shares nothing private.
  VERCEL_GIT_COMMIT_SHA is set by Vercel when it builds the site.
*/
export const dynamic = "force-static";

export function GET() {
  return Response.json({ commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local" });
}
