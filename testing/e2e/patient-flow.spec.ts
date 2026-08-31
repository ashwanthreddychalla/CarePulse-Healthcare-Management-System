// testing/e2e/patient-flow.spec.ts
// E2E Test: Patient Registration Flow
// Uses mock Appwrite — resets state before each test via /api/mock-reset
import { test, expect } from "@playwright/test";

const DEMO = {
  name: "John Doe",
  email: "john.doe@test.local",
  phone: "+15551234567",
  address: "123 Main Street, New York, NY 10001",
  occupation: "Software Engineer",
  emergencyContactName: "Jane Doe",
  emergencyContactNumber: "+15559876543",
  insuranceProvider: "BlueCross BlueShield",
  insurancePolicyNumber: "BC123456789",
  physician: "John Green",
};

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

async function fillRegistrationForm(page: any, email: string) {
  await expect(page.getByText("Welcome")).toBeVisible({ timeout: 10000 });

  await page.getByLabel("Email address").fill(email);
  await page.getByRole("textbox", { name: "Address", exact: true }).fill(DEMO.address);
  await page.getByLabel("Occupation", { exact: true }).fill(DEMO.occupation);
  await page.getByLabel("Emergency contact name", { exact: true }).fill(DEMO.emergencyContactName);
  await page.getByLabel("Emergency contact number", { exact: true }).fill(DEMO.emergencyContactNumber);
  await page.getByLabel("Insurance provider", { exact: true }).fill(DEMO.insuranceProvider);
  await page.getByLabel("Insurance policy number", { exact: true }).fill(DEMO.insurancePolicyNumber);

  await selectDropdownOption(page, "Select a physician", DEMO.physician);

  await page.getByText("Identification and Verfication").scrollIntoViewIfNeeded();
  await page.getByLabel("Identification Number", { exact: true }).fill("ID-12345");

  await page.getByText("Consent and Privacy").scrollIntoViewIfNeeded();
  const checkboxes = page.locator('button[role="checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    if ((await cb.getAttribute("data-state")) !== "checked") {
      await cb.click();
    }
  }
}

// ── Landing + Form Tests ──────────────────────────────────────────

test.describe("Landing Page", () => {
  test("loads home page with heading and form", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CarePulse/);
    await expect(page.getByText("Hi there")).toBeVisible();
    await expect(page.getByText("Get started with appointments")).toBeVisible();
    await expect(page.getByRole("button", { name: /Get Started/i })).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
  });

  test("shows Admin link", async ({ page }) => {
    await page.goto("/");
    const link = page.getByText("Admin");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/?admin=true");
  });

  test("form fields are initially empty", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.getByLabel("Email")).toHaveValue("");
  });
});

// ── Validation Tests ──────────────────────────────────────────────

test.describe("Form Validation", () => {
  test("shows error when submitting empty form", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Get Started/i }).click();
    await expect(page.getByText("Name must be at least 2 characters")).toBeVisible();
  });

  test("shows error for invalid email", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Full name").fill("John");
    await page.getByLabel("Email").fill("bad-email");
    await page.getByRole("button", { name: /Get Started/i }).click();
    await expect(page.getByText("Invalid email address")).toBeVisible();
  });

  test("shows error for invalid phone", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Full name").fill("John Doe");
    await page.getByLabel("Email").fill("john@test.com");
    await page.getByRole("button", { name: /Get Started/i }).click();
    await expect(page.getByText("Invalid phone number")).toBeVisible();
  });

  test("shows loading state on valid submission", async ({ page }) => {
    await resetMock(page);
    await page.goto("/");
    await page.getByLabel("Full name").fill(DEMO.name);
    await page.getByLabel("Email").fill(`loading-${Date.now()}@test.com`);
    await fillPhoneInput(page, DEMO.phone);
    await page.getByRole("button", { name: /Get Started/i }).click();
    await expect(page.getByText("Loading...")).toBeVisible();
  });
});

// ── Full Patient Journey ──────────────────────────────────────────

test.describe("Full Patient Journey", () => {
  test("home → register → appointment → success", async ({ page }) => {
    await resetMock(page);
    const ts = Date.now();
    const email = `john.${ts}@test.local`;

    // Step 1: Home page
    await page.goto("/");
    await expect(page.getByText("Hi there")).toBeVisible();

    // Step 2: Submit user form
    await page.getByLabel("Full name").fill(DEMO.name);
    await page.getByLabel("Email").fill(email);
    await fillPhoneInput(page, DEMO.phone);
    await page.getByRole("button", { name: /Get Started/i }).click();

    // Step 3: Register page
    await expect(page).toHaveURL(/\/patients\/.*\/register/, { timeout: 20000 });
    await fillRegistrationForm(page, email);
    await page.getByRole("button", { name: /Submit and Continue/i }).click();

    // Step 4: Appointment page
    await expect(page).toHaveURL(/\/patients\/.*\/new-appointment/, { timeout: 20000 });
    await expect(page.getByRole("heading", { name: "New Appointment" })).toBeVisible({ timeout: 10000 });

    await selectDropdownOption(page, "Select a doctor", DEMO.physician);
    await page.getByLabel("Appointment reason").fill("Annual check-up");
    await page.getByLabel("Comments/notes").fill("Morning preferred");
    await page.getByRole("button", { name: /Submit Apppointment/i }).click();

    // Step 5: Success page
    await expect(page).toHaveURL(/\/patients\/.*\/new-appointment\/success/, { timeout: 20000 });
    await expect(page.getByText("Your appointment request has been successfully submitted!")).toBeVisible({ timeout: 10000 });
  });
});
