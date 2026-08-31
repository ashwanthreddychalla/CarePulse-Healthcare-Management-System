// testing/frontend/homepage.test.tsx
import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Appwrite config to prevent env errors
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

// Mock server actions
jest.mock("@/lib/actions/patient.actions", () => ({
  createUser: jest.fn(),
  getUser: jest.fn(),
  registerPatient: jest.fn(),
  getPatient: jest.fn(),
}));

jest.mock("@/lib/actions/appointment.actions", () => ({
  createAppointment: jest.fn(),
  getRecentAppointmentList: jest.fn(),
  sendSMSNotification: jest.fn(),
  updateAppointment: jest.fn(),
  getAppointment: jest.fn(),
}));

import Home from "@/app/page";

describe("Home Page (Landing)", () => {
  it("renders the main heading", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByText(/Hi there 👋/)).toBeInTheDocument();
  });

  it("renders the subtitle text", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByText(/Get started with appointments/)).toBeInTheDocument();
  });

  it("renders the PatientForm (Get Started button)", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();
  });

  it("renders the logo image", () => {
    render(<Home searchParams={{}} />);
    const logos = screen.getAllByAltText("patient");
    expect(logos.length).toBeGreaterThan(0);
    expect(logos[0]).toHaveAttribute("src", "/assets/icons/logo-full.svg");
  });

  it("renders the copyright notice", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByText(/© 2024 CarePluse/)).toBeInTheDocument();
  });

  it("renders the Admin link", () => {
    render(<Home searchParams={{}} />);
    const adminLink = screen.getByText("Admin");
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute("href", "/?admin=true");
  });

  it("renders the patient form with name, email, and phone inputs", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("johndoe@gmail.com")).toBeInTheDocument();
  });

  it("renders full name input with label", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });

  it("renders email input with label", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders phone input with label", () => {
    render(<Home searchParams={{}} />);
    expect(screen.getByLabelText("Phone number")).toBeInTheDocument();
  });
});
