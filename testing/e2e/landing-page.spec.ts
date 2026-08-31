// testing/e2e/landing-page.spec.ts
// E2E Test: Landing Page
import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("loads with correct title and content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CarePulse/);
    await expect(page.getByText("Hi there")).toBeVisible();
    await expect(page.getByText("Get started with appointments")).toBeVisible();
  });

  test("displays logo and form inputs", async ({ page }) => {
    await page.goto("/");
    const logo = page.getByRole("img", { name: "patient" }).first();
    await expect(logo).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("displays Get Started button and Admin link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Get Started/i })).toBeVisible();
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("displays copyright notice", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("© 2024 CarePluse")).toBeVisible();
  });

  test("form fields are empty on load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.getByLabel("Email")).toHaveValue("");
  });
});
