// testing/e2e/error-handling.spec.ts
// E2E Test: Error Handling and Edge Cases
import { test, expect } from "@playwright/test";

async function resetMock(page: any) {
  await page.request.post("http://localhost:3000/api/mock-reset");
}

test.describe("Error Handling", () => {
  test("returns 404 for non-existent routes", async ({ page }) => {
    const response = await page.goto("/non-existent-page");
    expect(response?.status()).toBe(404);
  });

  test("shows validation errors on empty form submit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Get Started/i }).click();
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
  });

  test("admin passkey shows error for wrong passkey", async ({ page }) => {
    await page.goto("/?admin=true");
    await expect(page.getByText("Admin Access Verification")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /Enter Admin Passkey/i }).click();
    await expect(page.getByText("Invalid passkey")).toBeVisible();
  });

  test("register page handles invalid userId gracefully", async ({ page }) => {
    await resetMock(page);
    await page.goto("/patients/invalid-user-id-xyz/register");
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("invalid-user-id-xyz");
  });

  test("appointment page handles invalid userId gracefully", async ({ page }) => {
    await resetMock(page);
    await page.goto("/patients/invalid-user-id-xyz/new-appointment");
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("invalid-user-id-xyz");
  });
});
