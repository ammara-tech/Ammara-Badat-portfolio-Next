import { defineConfig, devices } from "@playwright/test";

/*
  Browser tests (npm run test:browser). They open the real site in a real browser
  (Chromium), as a laptop and as a phone, and click through it like a visitor.

  By default they test the live site. GitHub runs them after every deploy
  (.github/workflows/browser-tests.yml). To test something else:
    BASE_URL=http://localhost:3000 npm run test:browser

  They never send a real contact message or sign in: those requests are either
  answered by the test itself, or are the kind my API ignores before the database.
*/

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0, // one retry on GitHub, in case the network blips
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "https://ammara-badat-portfolio-next.vercel.app",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "laptop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
