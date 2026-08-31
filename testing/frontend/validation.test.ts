// testing/frontend/validation.test.ts
import "@testing-library/jest-dom";
import {
  UserFormValidation,
  PatientFormValidation,
  CreateAppointmentSchema,
  ScheduleAppointmentSchema,
  CancelAppointmentSchema,
  getAppointmentSchema,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("UserFormValidation", () => {
    const validUser = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+15551234567",
    };

    it("accepts valid user data", () => {
      const result = UserFormValidation.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        name: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects name shorter than 2 characters", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        name: "J",
      });
      expect(result.success).toBe(false);
    });

    it("rejects name longer than 50 characters", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        name: "A".repeat(51),
      });
      expect(result.success).toBe(false);
    });

    it("accepts name with exactly 2 characters", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        name: "Jo",
      });
      expect(result.success).toBe(true);
    });

    it("accepts name with exactly 50 characters", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        name: "A".repeat(50),
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email format", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
    });

    it("rejects email without @", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        email: "johnexample.com",
      });
      expect(result.success).toBe(false);
    });

    it("rejects phone without + prefix", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        phone: "15551234567",
      });
      expect(result.success).toBe(false);
    });

    it("rejects phone shorter than 10 digits after +", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        phone: "+123456789",
      });
      expect(result.success).toBe(false);
    });

    it("rejects phone longer than 15 digits after +", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        phone: "+1234567890123456",
      });
      expect(result.success).toBe(false);
    });

    it("accepts phone with 10 digits", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        phone: "+15551234567",
      });
      expect(result.success).toBe(true);
    });

    it("accepts phone with 15 digits", () => {
      const result = UserFormValidation.safeParse({
        ...validUser,
        phone: "+155512345678901",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing name field", () => {
      const result = UserFormValidation.safeParse({
        email: "john@example.com",
        phone: "+15551234567",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("PatientFormValidation", () => {
    const validPatient = {
      name: "John Doe",
      email: "john@example.com",
      phone: "+15551234567",
      birthDate: new Date("1990-01-01"),
      gender: "Male" as Gender,
      address: "123 Main Street, New York",
      occupation: "Software Engineer",
      emergencyContactName: "Jane Doe",
      emergencyContactNumber: "+15559876543",
      primaryPhysician: "John Green",
      insuranceProvider: "BlueCross",
      insurancePolicyNumber: "BC123456",
      treatmentConsent: true,
      disclosureConsent: true,
      privacyConsent: true,
    };

    it("accepts valid patient data", () => {
      const result = PatientFormValidation.safeParse(validPatient);
      expect(result.success).toBe(true);
    });

    it("accepts optional fields as undefined", () => {
      const result = PatientFormValidation.safeParse(validPatient);
      expect(result.success).toBe(true);
      // Optional fields can be omitted
      const { allergies, currentMedication, ...required } = validPatient;
      const result2 = PatientFormValidation.safeParse(required);
      expect(result2.success).toBe(true);
    });

    it("rejects invalid gender value", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        gender: "Unknown",
      });
      expect(result.success).toBe(false);
    });

    it("accepts all valid gender values", () => {
      ["Male", "Female", "Other"].forEach((gender) => {
        const result = PatientFormValidation.safeParse({
          ...validPatient,
          gender,
        });
        expect(result.success).toBe(true);
      });
    });

    it("rejects address shorter than 5 characters", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        address: "123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects occupation shorter than 2 characters", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        occupation: "X",
      });
      expect(result.success).toBe(false);
    });

    it("rejects treatmentConsent as false", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        treatmentConsent: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects disclosureConsent as false", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        disclosureConsent: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects privacyConsent as false", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        privacyConsent: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid primaryPhysician", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        primaryPhysician: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid insuranceProvider", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        insuranceProvider: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid insurancePolicyNumber", () => {
      const result = PatientFormValidation.safeParse({
        ...validPatient,
        insurancePolicyNumber: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("CreateAppointmentSchema", () => {
    const validAppointment = {
      primaryPhysician: "John Green",
      schedule: new Date("2026-09-15T10:00:00"),
      reason: "Annual check-up",
      note: "Morning preferred",
    };

    it("accepts valid appointment data", () => {
      const result = CreateAppointmentSchema.safeParse(validAppointment);
      expect(result.success).toBe(true);
    });

    it("rejects empty primaryPhysician", () => {
      const result = CreateAppointmentSchema.safeParse({
        ...validAppointment,
        primaryPhysician: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty reason", () => {
      const result = CreateAppointmentSchema.safeParse({
        ...validAppointment,
        reason: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects reason longer than 500 characters", () => {
      const result = CreateAppointmentSchema.safeParse({
        ...validAppointment,
        reason: "A".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it("accepts reason with exactly 2 characters", () => {
      const result = CreateAppointmentSchema.safeParse({
        ...validAppointment,
        reason: "OK",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid cancellationReason", () => {
      const result = CreateAppointmentSchema.safeParse({
        ...validAppointment,
        cancellationReason: "Schedule conflict",
      });
      expect(result.success).toBe(true);
    });

    it("makes note optional", () => {
      const { note, ...noNote } = validAppointment;
      const result = CreateAppointmentSchema.safeParse(noNote);
      expect(result.success).toBe(true);
    });
  });

  describe("CancelAppointmentSchema", () => {
    it("requires cancellationReason", () => {
      const result = CancelAppointmentSchema.safeParse({
        primaryPhysician: "John Green",
        schedule: new Date("2026-09-15"),
      });
      expect(result.success).toBe(false);
    });

    it("requires cancellationReason at least 2 characters", () => {
      const result = CancelAppointmentSchema.safeParse({
        primaryPhysician: "John Green",
        schedule: new Date("2026-09-15"),
        cancellationReason: "X",
      });
      expect(result.success).toBe(false);
    });

    it("accepts valid cancellation data", () => {
      const result = CancelAppointmentSchema.safeParse({
        primaryPhysician: "John Green",
        schedule: new Date("2026-09-15"),
        cancellationReason: "Schedule conflict",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("getAppointmentSchema", () => {
    it("returns CreateAppointmentSchema for 'create' type", () => {
      const schema = getAppointmentSchema("create");
      expect(schema).toBe(CreateAppointmentSchema);
    });

    it("returns CancelAppointmentSchema for 'cancel' type", () => {
      const schema = getAppointmentSchema("cancel");
      expect(schema).toBe(CancelAppointmentSchema);
    });

    it("returns ScheduleAppointmentSchema for unknown type", () => {
      const schema = getAppointmentSchema("schedule");
      expect(schema).toBe(ScheduleAppointmentSchema);
    });

    it("returns ScheduleAppointmentSchema for 'schedule' type", () => {
      const schema = getAppointmentSchema("schedule");
      expect(schema).toBe(ScheduleAppointmentSchema);
    });
  });
});
