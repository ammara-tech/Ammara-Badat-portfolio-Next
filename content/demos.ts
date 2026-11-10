/*
  Projects with a "Try the demo" button on their page (app/projects/[slug]/page.tsx), keyed by
  the page address (/projects/<key>). The button opens the live site with ?demo on the end, which
  puts "Try the demo" at the top of its sign-in screen: one press, no account, with example data.
*/
export const demos = new Set(["papertrail", "ticklist", "rememba", "shiftboard", "hiretrack", "stokvelbook"]);

/** "https://hiretrack-five-phi.vercel.app/" -> "https://hiretrack-five-phi.vercel.app/?demo" */
export function demoUrl(liveUrl: string) {
  const url = new URL(liveUrl);
  url.searchParams.set("demo", "");
  return url.toString().replace(/demo=$/, "demo").replace(/demo=&/, "demo&");
}
