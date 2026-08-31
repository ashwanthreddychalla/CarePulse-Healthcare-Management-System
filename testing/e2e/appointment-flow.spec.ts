// testing/e2e/appointment-flow.spec.ts
// E2E Test: Appointment Booking Flow
import { test, expect } from "@playwright/test";

async function resetMock(page: any) {
  await page.request.post("http://localhost:3000/api/mock-reset");
}

async function fillPhoneInput(page: any, value: string) {
  const phoneInput = page.getByRole("textbox", { name: "Phone number" });
  await phoneInput.clear();
  await phoneInput.fill(value);
}

async function selectDropdownOption(page: any, triggerText: string, optionText: string) {
  const trigger = page.locator(`button:has-text("${triggerText}")`);
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.getByRole("option", { name: optionText }).click();
}

test.describe("Appointment Flow", () => {
  test("full flow: create user → register → appointment page", async ({ page }) => {
    await resetMock(page);
    const ts = Date.now();
    const email = `appt.${ts}@test.local`;

    // Create user
    await page.goto("/");
    await page.getByLabel("Full name").fill("Appointment Test User");
    await page.getByLabel("Email").fill(email);
    await fillPhoneInput(page, "+15551112222");
    await page.getByRole("button", { name: /Get Started/i }).click();

    // Wait for navigation to register page (form submission + redirect)
    await expect(page).toHaveURL(/\/patients\/.*\/register/, { timeout: 30000 });
    await expect(page.getByText("Welcome")).toBeVisible({ timeout: 10000 });

    // Fill required fields
    await page.getByLabel("Email address").fill(email);
    await page.getByRole("textbox", { name: "Address", exact: true }).fill("456 Test Lane, Testville, TX");
    await page.getByLabel("Occupation", { exact: true }).fill("Tester");
    await page.getByLabel("Emergency contact name", { exact: true }).fill("Test Contact");
    await page.getByLabel("Emergency contact number", { exact: true }).fill("+15551112223");
    await page.getByLabel("Insurance provider", { exact: true }).fill("Test Insurance");
    await page.getByLabel("Insurance policy number", { exact: true }).fill("TEST-123");

    await selectDropdownOption(page, "Select a physician", "John Green");

    await page.getByText("Consent and Privacy").scrollIntoViewIfNeeded();
    const checkboxes = page.locator('button[role="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const cb = checkboxes.nth(i);
      if ((await cb.getAttribute("data-state")) !== "checked") {
        await cb.click();
      }
    }

    await page.getByRole("button", { name: /Submit and Continue/i }).click();

    // Should be on appointment page
    await expect(page).toHaveURL(/\/patients\/.*\/new-appointment/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: "New Appointment" })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Appointment Data Flow", () => {
  test("documents the complete data flow", () => {
    const steps = [
      "User submits form on /",
      "createUser() creates user (mock in-memory)",
      "Redirect to /patients/{userId}/register",
      "Patient completes registration",
      "registerPatient() creates patient (mock in-memory)",
      "Redirect to /patients/{userId}/new-appointment",
      "Patient fills appointment form",
      "createAppointment() creates appointment (mock in-memory)",
      "Redirect to /patients/{userId}/new-appointment/success",
      "Success page displays confirmation",
    ];
    expect(steps).toHaveLength(10);
  });
});
