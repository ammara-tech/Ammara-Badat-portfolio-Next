import { expect, test } from "@playwright/test";

/*
  The admin sign-in page. These tests never type a real password or press Sign in:
  they check what a stranger sees, and the Show password button.
*/

test.describe("admin sign-in page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
  });

  test("shows only the sign-in form, never the dashboard", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Admin sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    // Nothing from the dashboard is on the page for someone who isn't signed in
    await expect(page.getByText("Recent activity")).toHaveCount(0);
    await expect(page.getByText("Add a project")).toHaveCount(0);
  });

  test("tells search engines not to list it", async ({ page }) => {
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  });

  test("the password is hidden until I press Show, and hidden again with Hide", async ({ page }) => {
    const password = page.getByLabel("Password", { exact: true });
    await password.fill("example-not-real");
    await expect(password).toHaveAttribute("type", "password");

    const toggle = page.getByRole("button", { name: /Show password/ });
    await toggle.click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(page.getByRole("button", { name: /Hide password/ })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: /Hide password/ }).click();
    await expect(password).toHaveAttribute("type", "password");
  });
});
