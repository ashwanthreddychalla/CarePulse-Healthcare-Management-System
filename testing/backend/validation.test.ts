// testing/backend/validation.test.ts
// Backend validation tests — testing Zod schemas in a pure Node environment
// These tests verify the validation logic that would be used by server actions

import {
  UserFormValidation,
  PatientFormValidation,
  CreateAppointmentSchema,
  ScheduleAppointmentSchema,
  CancelAppointmentSchema,
  getAppointmentSchema,
} from "@/lib/validation";

describe("Backend: Validation Logic", () => {
  describe("UserFormValidation (Server-side)", () => {
    it("validates complete user creation payload", () => {
      const payload = {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+44123456789012",
      };
      const result = UserFormValidation.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects user with all empty fields", () => {
      const result = UserFormValidation.safeParse({
        name: "",
        email: "",
        phone: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });

    it("validates email with various formats", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.com",
        "a@b.co",
      ];

      validEmails.forEach((email) => {
        const result = UserFormValidation.safeParse({
          name: "Test User",
          email,
          phone: "+15551234567",
        });
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid email formats", () => {
      const invalidEmails = [
        "",
        "plainaddress",
        "@missinglocal.com",
        "missing@.com",
        "missing@domain",
      ];

      invalidEmails.forEach((email) => {
        const result = UserFormValidation.safeParse({
          name: "Test User",
          email,
          phone: "+15551234567",
        });
        expect(result.success).toBe(false);
      });
    });

    it("validates phone numbers with international format", () => {
      const validPhones = [
        "+15551234567",     // US (11 digits)
        "+447911123456",    // UK (12 digits)
        "+919876543210",    // India (12 digits)
      ];

      validPhones.forEach((phone) => {
        const result = UserFormValidation.safeParse({
          name: "Test User",
          email: "test@example.com",
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it("rejects phone numbers without + prefix", () => {
      const result = UserFormValidation.safeParse({
        name: "Test User",
        email: "test@example.com",
        phone: "15551234567",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Appointment Validation (Server-side)", () => {
    it("validates complete appointment creation payload", () => {
      const payload = {
        primaryPhysician: "John Green",
        schedule: new Date("2026-09-15T10:00:00"),
        reason: "Annual check-up",
        note: "Morning preferred",
      };
      const result = CreateAppointmentSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects appointment with missing required fields", () => {
      const result = CreateAppointmentSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("validates cancel appointment schema requires cancellationReason", () => {
      const withoutReason = {
        primaryPhysician: "John Green",
        schedule: new Date("2026-09-15T10:00:00"),
      };

      const result = CancelAppointmentSchema.safeParse(withoutReason);
      expect(result.success).toBe(false);
    });

    it("validates cancel appointment with reason", () => {
      const withReason = {
        primaryPhysician: "John Green",
        schedule: new Date("2026-09-15T10:00:00"),
        cancellationReason: "Schedule conflict",
      };

      const result = CancelAppointmentSchema.safeParse(withReason);
      expect(result.success).toBe(true);
    });

    it("validates schedule appointment schema does not require cancellationReason", () => {
      const payload = {
        primaryPhysician: "John Green",
        schedule: new Date("2026-09-15T10:00:00"),
      };
      const result = ScheduleAppointmentSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });

  describe("Schema Selector (getAppointmentSchema)", () => {
    it("returns correct schema for 'create' type", () => {
      const schema = getAppointmentSchema("create");
      // CreateAppointmentSchema requires reason
      const result = schema.safeParse({
        primaryPhysician: "Dr",
        schedule: new Date(),
      });
      expect(result.success).toBe(false); // missing reason
    });

    it("returns correct schema for 'cancel' type", () => {
      const schema = getAppointmentSchema("cancel");
      // CancelAppointmentSchema requires cancellationReason
      const result = schema.safeParse({
        primaryPhysician: "Dr",
        schedule: new Date(),
      });
      expect(result.success).toBe(false); // missing cancellationReason
    });

    it("defaults to ScheduleAppointmentSchema for unknown type", () => {
      const schema = getAppointmentSchema("unknown");
      // ScheduleAppointmentSchema does NOT require reason
      const result = schema.safeParse({
        primaryPhysician: "Dr",
        schedule: new Date(),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("PatientFormValidation (Server-side)", () => {
    it("validates complete patient registration payload", () => {
      const payload = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+15551234567",
        birthDate: new Date("1990-05-15"),
        gender: "Female" as Gender,
        address: "456 Oak Avenue, Brooklyn, NY 11201",
        occupation: "Doctor",
        emergencyContactName: "John Doe",
        emergencyContactNumber: "+15559876543",
        primaryPhysician: "Leila Cameron",
        insuranceProvider: "Aetna",
        insurancePolicyNumber: "AET123456",
        treatmentConsent: true,
        disclosureConsent: true,
        privacyConsent: true,
      };

      const result = PatientFormValidation.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it("rejects patient with no consents", () => {
      const payload = {
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+15551234567",
        birthDate: new Date("1990-05-15"),
        gender: "Female" as Gender,
        address: "456 Oak Avenue, Brooklyn, NY 11201",
        occupation: "Doctor",
        emergencyContactName: "John Doe",
        emergencyContactNumber: "+15559876543",
        primaryPhysician: "Leila Cameron",
        insuranceProvider: "Aetna",
        insurancePolicyNumber: "AET123456",
        treatmentConsent: false,
        disclosureConsent: false,
        privacyConsent: false,
      };

      const result = PatientFormValidation.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const consentErrors = result.error.issues.filter(
          (issue) =>
            issue.path.includes("treatmentConsent") ||
            issue.path.includes("disclosureConsent") ||
            issue.path.includes("privacyConsent")
        );
        expect(consentErrors.length).toBe(3);
      }
    });

    it("validates address minimum length", () => {
      const result = PatientFormValidation.safeParse({
        name: "Test",
        email: "test@test.com",
        phone: "+15551234567",
        birthDate: new Date("1990-01-01"),
        gender: "Male",
        address: "12",
        occupation: "Engineer",
        emergencyContactName: "Mom",
        emergencyContactNumber: "+15551234567",
        primaryPhysician: "John Green",
        insuranceProvider: "BlueCross",
        insurancePolicyNumber: "BC123",
        treatmentConsent: true,
        disclosureConsent: true,
        privacyConsent: true,
      });
      expect(result.success).toBe(false);
    });
  });
});
