// testing/test-data/patient.ts
// DEMO/TEST patient data — NOT real patient information
// Use these values in tests only, never in production code.

export const DEMO_PATIENT = {
  name: "John Doe",
  email: "john.e2e.test@example.com",
  phone: "+15551234567",
  birthDate: new Date("1990-05-15"),
  gender: "Male" as Gender,
  address: "123 Main Street, New York, NY 10001",
  occupation: "Software Engineer",
  emergencyContactName: "Jane Doe",
  emergencyContactNumber: "+15559876543",
  primaryPhysician: "John Green",
  insuranceProvider: "BlueCross BlueShield",
  insurancePolicyNumber: "BC123456789",
  allergies: "Peanuts",
  currentMedication: "Ibuprofen 200mg",
  familyMedicalHistory: "Mother had hypertension",
  pastMedicalHistory: "Asthma diagnosis in childhood",
  identificationType: "Driver's License",
  identificationNumber: "D1234567",
  treatmentConsent: true,
  disclosureConsent: true,
  privacyConsent: true,
};

export const DEMO_USER = {
  name: "John Doe",
  email: "john.e2e.test@example.com",
  phone: "+15551234567",
};

export const DEMO_USER_INVALID = {
  name: "",
  email: "not-an-email",
  phone: "123",
};

export const DEMO_PATIENT_INVALID = {
  name: "",
  email: "invalid-email",
  phone: "not-a-phone",
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "bad",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};
