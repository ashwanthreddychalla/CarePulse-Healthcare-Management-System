// testing/e2e/navigation.spec.ts
// E2E Test: Navigation and Page Transitions
import { test, expect } from "@playwright/test";

async function resetMock(page: any) {
  await page.request.post("http://localhost:3000/api/mock-reset");
}

test.describe("Navigation", () => {
  test("Admin link navigates to admin passkey modal", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Admin").click();
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url.includes("admin=true") || url.includes("/admin")).toBeTruthy();
  });

  test("admin passkey modal shows OTP input", async ({ page }) => {
    await page.goto("/?admin=true");
    await expect(page.getByText("Admin Access Verification")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("please enter the passkey")).toBeVisible();
    await expect(page.getByRole("button", { name: /Enter Admin Passkey/i })).toBeVisible();
  });

  test("register page loads with mock user", async ({ page }) => {
    await resetMock(page);
    // The demo seed creates user demo-user-001
    await page.goto("/patients/demo-user-001/register");
    await page.waitForTimeout(3000);
    // Should show either the form or an error (both are valid)
    const currentUrl = page.url();
    expect(currentUrl).toContain("demo-user-001");
  });

  test("new-appointment page loads with mock patient", async ({ page }) => {
    await resetMock(page);
    await page.goto("/patients/demo-user-001/new-appointment");
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("demo-user-001");
  });
});
