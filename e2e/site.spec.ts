import { expect, test } from "@playwright/test";

/* The parts of the site that tests in tests/ can't see: real pages, real headers, real phones. */

test("every main page loads with its own title", async ({ page }) => {
  for (const [path, title] of [
    ["/", /Ammara Badat/],
    ["/about", /About/],
    ["/projects", /Projects/],
    ["/skills", /Skills/],
    ["/notes", /notes/i],
    ["/contact", /Contact/],
    ["/cv", /CV/],
    ["/recruiters", /recruiters/],
    ["/status", /Status/],
    ["/now", /Now/],
    ["/guestbook", /Guestbook/],
  ] as const) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page).toHaveTitle(title);
  }
});

test("the CV PDF downloads, built from my CV page", async ({ request }) => {
  const res = await request.get("/cv/Ammara-Badat-CV.pdf");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("application/pdf");
  const body = await res.body();
  expect(body.subarray(0, 5).toString()).toBe("%PDF-");
});

test("a project that doesn't exist gets a real 404", async ({ page }) => {
  const res = await page.goto("/projects/this-project-does-not-exist");
  expect(res?.status()).toBe(404);
});

test("the live site sends my security headers", async ({ request }) => {
  const res = await request.get("/");
  const headers = res.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["strict-transport-security"]).toContain("max-age=");
});

test("the phone menu opens, shows the links and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The menu button only exists on phones");
  await page.goto("/");
  const button = page.getByRole("button", { name: "Open menu" });
  await button.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  const menu = page.locator("#site-menu");
  await expect(menu.getByRole("link", { name: "Projects" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu.getByRole("link", { name: "Projects" })).toBeHidden();
});

test("long pages show what's below: On this page links and a More below button", async ({ page }) => {
  await page.goto("/about");
  const links = page.getByRole("navigation", { name: "On this page" });
  await expect(links.getByRole("link", { name: /Certifications/ })).toBeVisible();
  const more = page.getByRole("button", { name: "More below" });
  await expect(more).toBeVisible();
  await more.click();
  // It moves to the next section and takes keyboard focus there, then fades away
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeFocused();
  await expect(more).toHaveCSS("opacity", "0");
});
