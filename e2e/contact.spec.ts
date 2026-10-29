import { expect, test } from "@playwright/test";

/*
  The contact form, tested in a real browser.
  No real message is ever sent: when a test presses Send, the test itself answers
  instead of my server (page.route). The last tests call my real API, but only with
  requests it throws away before the database (spam or mistakes), so nothing is saved.
*/

test.describe("contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("shows the form, and hides the spam trap from people", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
    // The honeypot field exists for bots, but people can't see or Tab to it
    const trap = page.locator('input[name="website"]');
    await expect(trap).toHaveCount(1);
    await expect(trap).not.toBeInViewport();
    await expect(trap).toHaveAttribute("tabindex", "-1");
  });

  test("the browser stops a message that is too short", async ({ page }) => {
    await page.getByRole("textbox", { name: "Name" }).fill("Test Visitor");
    await page.getByRole("textbox", { name: "Email" }).fill("visitor@example.com");
    await page.getByRole("textbox", { name: "Message" }).fill("Hi");
    let sent = false;
    await page.route("**/api/contact", (route) => {
      sent = true;
      return route.fulfill({ json: { ok: true } });
    });
    await page.getByRole("button", { name: /Send message/ }).click();
    const tooShort = await page.getByRole("textbox", { name: "Message" }).evaluate((el) => (el as HTMLTextAreaElement).validity.tooShort);
    expect(tooShort).toBe(true);
    expect(sent).toBe(false);
  });

  test("sends the right details and says thank you", async ({ page }) => {
    let body: Record<string, unknown> = {};
    await page.route("**/api/contact", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true } });
    });
    await page.getByRole("textbox", { name: "Name" }).fill("Test Visitor");
    await page.getByRole("textbox", { name: "Email" }).fill("visitor@example.com");
    await page.getByRole("textbox", { name: "Message" }).fill("Hello Ammara, this is an automatic test.");
    await page.getByRole("button", { name: /Send message/ }).click();

    await expect(page.getByText("Message sent")).toBeVisible();
    expect(body.name).toBe("Test Visitor");
    expect(body.website).toBe(""); // a real person never fills in the spam trap
    expect(typeof body.elapsedMs).toBe("number");
  });

  test("shows the server's error message if something goes wrong", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 429, json: { ok: false, error: "Too many messages. Please try again later." } }),
    );
    await page.getByRole("textbox", { name: "Name" }).fill("Test Visitor");
    await page.getByRole("textbox", { name: "Email" }).fill("visitor@example.com");
    await page.getByRole("textbox", { name: "Message" }).fill("Hello Ammara, this is an automatic test.");
    await page.getByRole("button", { name: /Send message/ }).click();
    await expect(page.getByRole("alert")).toContainText("Too many messages");
  });

  test("keeps what the visitor typed after a refresh, until Start over", async ({ page }) => {
    await page.getByRole("textbox", { name: "Name" }).fill("Test Visitor");
    await page.getByRole("textbox", { name: "Message" }).fill("A message I don't want to lose.");
    await page.waitForTimeout(800); // the draft is saved half a second after typing stops
    await page.reload();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("Test Visitor");
    await expect(page.getByText("I kept what you typed earlier")).toBeVisible();

    await page.getByRole("button", { name: "Start over" }).click();
    await expect(page.getByRole("textbox", { name: "Name" })).toHaveValue("");
  });
});

test.describe("contact API (requests it throws away, so nothing is saved)", () => {
  const person = { name: "Test Visitor", email: "visitor@example.com", message: "Hello, this is an automatic test.", website: "" };

  test("quietly ignores a bot that fills in the spam trap", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { ...person, website: "http://spam.example", elapsedMs: 9000 } });
    expect(res.status()).toBe(200); // a fake "sent", so the bot learns nothing
    expect(await res.json()).toEqual({ ok: true });
  });

  test("quietly ignores a form sent faster than a person could type", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { ...person, elapsedMs: 200 } });
    expect(res.status()).toBe(200);
  });

  test("explains a real mistake, like a wrong email address", async ({ request }) => {
    const res = await request.post("/api/contact", { data: { ...person, email: "not-an-email", elapsedMs: 9000 } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("valid email");
  });
});
