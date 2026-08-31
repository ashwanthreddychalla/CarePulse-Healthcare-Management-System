// testing/test-data/appointment.ts
// DEMO/TEST appointment data — NOT real appointment information
// Use these values in tests only, never in production code.

export const DEMO_APPOINTMENT = {
  userId: "demo-user-id-123",
  patient: "demo-patient-id-456",
  primaryPhysician: "John Green",
  reason: "Annual check-up",
  schedule: new Date("2026-09-15T10:00:00"),
  status: "pending" as Status,
  note: "Prefer morning appointments",
};

export const DEMO_APPOINTMENT_INVALID = {
  userId: "",
  patient: "",
  primaryPhysician: "",
  reason: "",
  schedule: new Date("invalid"),
  status: "pending" as Status,
  note: "",
};

export const DEMO_APPOINTMENT_UPDATE = {
  appointmentId: "demo-appointment-id-789",
  userId: "demo-user-id-123",
  timeZone: "America/New_York",
  appointment: {
    primaryPhysician: "Leila Cameron",
    schedule: new Date("2026-09-20T14:00:00"),
    status: "scheduled" as Status,
    cancellationReason: undefined,
  },
  type: "schedule",
};
