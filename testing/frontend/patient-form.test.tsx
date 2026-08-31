// testing/frontend/patient-form.test.tsx
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock Appwrite config
jest.mock("@/lib/appwrite.config", () => ({
  ENDPOINT: "https://cloud.appwrite.io/v1",
  PROJECT_ID: "demo-project",
  API_KEY: "demo-key",
  DATABASE_ID: "demo-db",
  PATIENT_COLLECTION_ID: "demo-patient",
  APPOINTMENT_COLLECTION_ID: "demo-appointment",
  BUCKET_ID: "demo-bucket",
  databases: {},
  users: {},
  messaging: {},
  storage: {},
}));

const mockCreateUser = jest.fn();
jest.mock("@/lib/actions/patient.actions", () => ({
  createUser: (...args: any[]) => mockCreateUser(...args),
}));

import { PatientForm } from "@/components/forms/PatientForm";

describe("PatientForm Component", () => {
  beforeEach(() => {
    mockCreateUser.mockReset();
  });

  it("renders the form with all three input fields", () => {
    render(<PatientForm />);
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone number")).toBeInTheDocument();
  });

  it("renders the Get Started submit button", () => {
    render(<PatientForm />);
    expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();
  });

  it("renders the heading text", () => {
    render(<PatientForm />);
    expect(screen.getByText(/Hi there 👋/)).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<PatientForm />);
    expect(screen.getByText(/Get started with appointments/)).toBeInTheDocument();
  });

  it("shows validation error when name is empty on submit", async () => {
    const user = userEvent.setup();
    render(<PatientForm />);

    const submitButton = screen.getByRole("button", { name: /Get Started/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name must be at least 2 characters")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<PatientForm />);

    const nameInput = screen.getByLabelText("Full name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "not-an-email");

    const submitButton = screen.getByRole("button", { name: /Get Started/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid phone number", async () => {
    const user = userEvent.setup();
    render(<PatientForm />);

    const nameInput = screen.getByLabelText("Full name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    // Submit with empty phone to trigger validation
    const submitButton = screen.getByRole("button", { name: /Get Started/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid phone number")).toBeInTheDocument();
    });
  });

  it("calls createUser with valid data on submit", async () => {
    const user = userEvent.setup();
    mockCreateUser.mockResolvedValue({ $id: "new-user-123" });

    render(<PatientForm />);

    const nameInput = screen.getByLabelText("Full name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    // For phone input, interact with the PhoneInput component
    const phoneInput = screen.getByLabelText("Phone number");
    await user.type(phoneInput, "+15551234567");

    const submitButton = screen.getByRole("button", { name: /Get Started/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalled();
    });
  });

  it("displays loading state during submission", async () => {
    const user = userEvent.setup();
    // Never resolve createUser to keep loading state
    mockCreateUser.mockImplementation(() => new Promise(() => {}));

    render(<PatientForm />);

    const nameInput = screen.getByLabelText("Full name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    const phoneInput = screen.getByLabelText("Phone number");
    await user.type(phoneInput, "+15551234567");

    const submitButton = screen.getByRole("button", { name: /Get Started/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  it("all form fields are initially empty", () => {
    render(<PatientForm />);

    const nameInput = screen.getByLabelText("Full name");
    const emailInput = screen.getByLabelText("Email");

    expect(nameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
  });
});
