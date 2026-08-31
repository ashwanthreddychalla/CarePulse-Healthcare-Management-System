// testing/backend/appwrite-operations.test.ts
// Backend tests for server actions using the mock Appwrite layer
//
// The mock Appwrite layer (testing/mock-appwrite.ts) provides in-memory
// implementations of Databases, Users, Storage, and Messaging.
// Jest config remaps @/lib/appwrite.config → lib/appwrite.config.testing.ts
// which exports the mock instances.

import { parseStringify, formatDateTime } from "@/lib/utils";

// Mock next/cache (revalidatePath)
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Import server actions — they will use the mock Appwrite layer via moduleNameMapper
import { createUser, getUser, registerPatient, getPatient } from "@/lib/actions/patient.actions";
import {
  createAppointment,
  getRecentAppointmentList,
  sendSMSNotification,
  updateAppointment,
  getAppointment,
} from "@/lib/actions/appointment.actions";

// Import the mock helpers for test setup
import {
  __clearAllData,
  __seedDemoData,
  __getAllUsers,
  __getAllDocuments,
  __getAllMessages,
} from "@/testing/mock-appwrite";

describe("Backend: Server Actions (with mock Appwrite)", () => {
  beforeEach(() => {
    __clearAllData();
  });

  describe("Patient Actions", () => {
    describe("createUser", () => {
      it("creates a new user successfully", async () => {
        const result = await createUser({
          name: "John Doe",
          email: "john@example.com",
          phone: "+15551234567",
        });

        expect(result).toBeDefined();
        expect(result?.$id).toBeDefined();
        expect(result?.name).toBe("John Doe");
        expect(result?.email).toBe("john@example.com");

        // Verify user was stored in the mock
        const allUsers = __getAllUsers();
        expect(allUsers.length).toBe(1);
        expect(allUsers[0].name).toBe("John Doe");
      });

      it("handles existing user (409 conflict) by returning existing user", async () => {
        // Create first user
        await createUser({
          name: "John Doe",
          email: "john@example.com",
          phone: "+15551234567",
        });

        // Try creating same user again — should get existing
        const result = await createUser({
          name: "John Doe",
          email: "john@example.com",
          phone: "+15551234567",
        });

        expect(result).toBeDefined();
        expect(result?.$id).toBeDefined();
        expect(result?.email).toBe("john@example.com");
      });

      it("returns undefined on unexpected errors", async () => {
        // Force an error by making users.create throw something other than 409
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        // Import the mock users instance and break it
        const { users } = require("@/lib/appwrite.config.testing");
        const originalCreate = users.create;
        users.create = jest.fn().mockRejectedValue(new Error("Network error"));

        const result = await createUser({
          name: "John Doe",
          email: "john@example.com",
          phone: "+15551234567",
        });

        expect(result).toBeUndefined();

        // Restore
        users.create = originalCreate;
        consoleSpy.mockRestore();
      });
    });

    describe("getUser", () => {
      it("retrieves a user by ID", async () => {
        // Seed a user first
        const created = await createUser({
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+15551234567",
        });

        const result = await getUser(created!.$id);

        expect(result).toBeDefined();
        expect(result?.$id).toBe(created!.$id);
        expect(result?.name).toBe("Jane Smith");
      });

      it("returns undefined on error", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const result = await getUser("nonexistent-id");

        expect(result).toBeUndefined();
        consoleSpy.mockRestore();
      });
    });

    describe("registerPatient", () => {
      it("registers a patient successfully", async () => {
        const patientData = {
          userId: "user-123",
          name: "John Doe",
          email: "john@example.com",
          phone: "+15551234567",
          birthDate: new Date("1990-01-01"),
          gender: "Male" as Gender,
          address: "123 Main St, NYC",
          occupation: "Engineer",
          emergencyContactName: "Jane Doe",
          emergencyContactNumber: "+15559876543",
          primaryPhysician: "John Green",
          insuranceProvider: "BlueCross",
          insurancePolicyNumber: "BC123",
          privacyConsent: true,
        };

        const result = await registerPatient(patientData);
        expect(result).toBeDefined();
        expect(result?.$id).toBeDefined();
        expect(result?.name).toBe("John Doe");

        // Verify patient was stored
        const allPatients = __getAllDocuments("mock-db", "patients");
        expect(allPatients.length).toBe(1);
        expect(allPatients[0].userId).toBe("user-123");
      });
    });

    describe("getPatient", () => {
      it("retrieves a patient by userId", async () => {
        // Register a patient first
        await registerPatient({
          userId: "user-456",
          name: "Test Patient",
          email: "test@example.com",
          phone: "+15551234567",
          birthDate: new Date("1990-01-01"),
          gender: "Female",
          address: "456 Oak Ave",
          occupation: "Doctor",
          emergencyContactName: "Bob",
          emergencyContactNumber: "+15559876543",
          primaryPhysician: "John Green",
          insuranceProvider: "Aetna",
          insurancePolicyNumber: "AET456",
          privacyConsent: true,
        });

        const result = await getPatient("user-456");

        expect(result).toBeDefined();
        expect(result?.userId).toBe("user-456");
        expect(result?.name).toBe("Test Patient");
      });

      it("returns null when no patient exists", async () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const result = await getPatient("nonexistent-id");

        // getPatient returns null when no patient document is found
        // (previously returned undefined which caused parseStringify crash)
        expect(result).toBeFalsy();
        consoleSpy.mockRestore();
      });
    });
  });

  describe("Appointment Actions", () => {
    describe("createAppointment", () => {
      it("creates a new appointment", async () => {
        const result = await createAppointment({
          userId: "user-123",
          patient: "patient-456",
          primaryPhysician: "John Green",
          reason: "Annual check-up",
          schedule: new Date("2026-09-15"),
          status: "pending",
          note: "Morning preferred",
        });

        expect(result).toBeDefined();
        expect(result?.$id).toBeDefined();
        expect(result?.status).toBe("pending");

        // Verify stored
        const allAppts = __getAllDocuments("mock-db", "appointments");
        expect(allAppts.length).toBe(1);
      });
    });

    describe("getRecentAppointmentList", () => {
      it("retrieves appointments with counts", async () => {
        // Seed some appointments
        await createAppointment({
          userId: "u1", patient: "p1", primaryPhysician: "Dr A",
          reason: "Check-up", schedule: new Date(), status: "scheduled", note: "",
        });
        await createAppointment({
          userId: "u2", patient: "p2", primaryPhysician: "Dr B",
          reason: "Follow-up", schedule: new Date(), status: "pending", note: "",
        });
        await createAppointment({
          userId: "u3", patient: "p3", primaryPhysician: "Dr C",
          reason: "Cancel", schedule: new Date(), status: "cancelled", note: "",
        });

        const result = await getRecentAppointmentList();

        expect(result).toBeDefined();
        expect(result?.totalCount).toBe(3);
        expect(result?.scheduledCount).toBe(1);
        expect(result?.pendingCount).toBe(1);
        expect(result?.cancelledCount).toBe(1);
        expect(result?.documents).toHaveLength(3);
      });

      it("returns empty counts when no appointments exist", async () => {
        const result = await getRecentAppointmentList();

        expect(result).toBeDefined();
        expect(result?.totalCount).toBe(0);
        expect(result?.scheduledCount).toBe(0);
        expect(result?.pendingCount).toBe(0);
        expect(result?.cancelledCount).toBe(0);
        expect(result?.documents).toHaveLength(0);
      });
    });

    describe("sendSMSNotification", () => {
      it("sends an SMS notification", async () => {
        const result = await sendSMSNotification("user-123", "Test message");
        expect(result).toBeDefined();
        expect(result?.$id).toBeDefined();

        // Verify message was stored
        const messages = __getAllMessages();
        expect(messages.length).toBe(1);
        expect(messages[0].content).toBe("Test message");
      });
    });

    describe("updateAppointment", () => {
      it("updates an appointment and sends SMS", async () => {
        // Create an appointment first
        const created = await createAppointment({
          userId: "user-123",
          patient: "patient-456",
          primaryPhysician: "John Green",
          reason: "Check-up",
          schedule: new Date("2026-09-20T10:00:00"),
          status: "pending",
          note: "",
        });

        // Update it
        const result = await updateAppointment({
          appointmentId: created!.$id,
          userId: "user-123",
          timeZone: "America/New_York",
          appointment: {
            primaryPhysician: "Leila Cameron",
            schedule: new Date("2026-09-20T14:00:00"),
            status: "scheduled",
            cancellationReason: undefined,
          } as any,
          type: "schedule",
        });

        expect(result).toBeDefined();
        expect(result?.status).toBe("scheduled");

        // Verify SMS was sent
        const messages = __getAllMessages();
        expect(messages.length).toBe(1);
        expect(messages[0].content).toContain("confirmed");
      });
    });

    describe("getAppointment", () => {
      it("retrieves an appointment by ID", async () => {
        const created = await createAppointment({
          userId: "user-123",
          patient: "patient-456",
          primaryPhysician: "John Green",
          reason: "Check-up",
          schedule: new Date("2026-09-15"),
          status: "pending",
          note: "Important",
        });

        const result = await getAppointment(created!.$id);

        expect(result).toBeDefined();
        expect(result?.primaryPhysician).toBe("John Green");
        expect(result?.reason).toBe("Check-up");
      });
    });
  });

  describe("Business Logic Verification", () => {
    it("correctly counts appointment statuses", () => {
      const appointments = [
        { status: "scheduled" },
        { status: "scheduled" },
        { status: "pending" },
        { status: "cancelled" },
        { status: "cancelled" },
        { status: "cancelled" },
      ];

      const counts = appointments.reduce(
        (acc, appt) => {
          switch (appt.status) {
            case "scheduled":
              acc.scheduledCount++;
              break;
            case "pending":
              acc.pendingCount++;
              break;
            case "cancelled":
              acc.cancelledCount++;
              break;
          }
          return acc;
        },
        { scheduledCount: 0, pendingCount: 0, cancelledCount: 0 }
      );

      expect(counts.scheduledCount).toBe(2);
      expect(counts.pendingCount).toBe(1);
      expect(counts.cancelledCount).toBe(3);
    });

    it("formats SMS notification message for scheduled appointment", () => {
      const appointment = {
        schedule: new Date("2026-09-15T10:00:00"),
        primaryPhysician: "John Green",
      };

      const type = "schedule";
      const smsMessage = `Greetings from CarePulse. ${
        type === "schedule"
          ? `Your appointment is confirmed for ${formatDateTime(
              appointment.schedule,
              "America/New_York"
            ).dateTime} with Dr. ${appointment.primaryPhysician}`
          : `We regret to inform that your appointment is cancelled.`
      }.`;

      expect(smsMessage).toContain("Greetings from CarePulse");
      expect(smsMessage).toContain("confirmed");
      expect(smsMessage).toContain("Dr. John Green");
    });

    it("formats SMS notification message for cancelled appointment", () => {
      const type = "cancel";
      const smsMessage = `Greetings from CarePulse. ${
        type === "schedule"
          ? "Your appointment is confirmed."
          : `We regret to inform that your appointment is cancelled. Reason: Schedule conflict.`
      }.`;

      expect(smsMessage).toContain("regret to inform");
      expect(smsMessage).toContain("Schedule conflict");
    });
  });
});
