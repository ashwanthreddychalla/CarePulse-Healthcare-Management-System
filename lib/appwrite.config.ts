// When USE_MOCK_APPWRITE=true, use the in-memory mock instead of real Appwrite.
// This is used by Playwright E2E tests running against the dev server.
//
// ⚠️  This does NOT prove the real Appwrite integration works.
//     It is for local testing only.

import { MockDatabases, MockUsers, MockStorage, MockMessaging } from "../testing/mock-appwrite";

const isMock = process.env.USE_MOCK_APPWRITE === "true";

// Always export the same variable names — real or mock values
export const ENDPOINT = isMock
  ? "https://mock-appwrite.io/v1"
  : process.env.NEXT_PUBLIC_ENDPOINT!;
export const PROJECT_ID = isMock
  ? "mock-project-id"
  : process.env.PROJECT_ID!;
export const API_KEY = isMock ? "mock-api-key" : process.env.API_KEY!;
export const DATABASE_ID = isMock ? "mock-db" : process.env.DATABASE_ID!;
export const PATIENT_COLLECTION_ID = isMock
  ? "patients"
  : process.env.PATIENT_COLLECTION_ID!;
export const DOCTOR_COLLECTION_ID = isMock
  ? "doctors"
  : process.env.DOCTOR_COLLECTION_ID!;
export const APPOINTMENT_COLLECTION_ID = isMock
  ? "appointments"
  : process.env.APPOINTMENT_COLLECTION_ID!;
export const BUCKET_ID = isMock
  ? "mock-bucket"
  : process.env.NEXT_PUBLIC_BUCKET_ID!;

// In mock mode, use in-memory implementations.
// In real mode, create Appwrite SDK clients.
export const databases: any = isMock
  ? new MockDatabases()
  : (() => {
      const sdk = require("node-appwrite");
      const client = new sdk.Client();
      client
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
        .setProject(process.env.PROJECT_ID!)
        .setKey(process.env.API_KEY!);
      return new sdk.Databases(client);
    })();

export const users: any = isMock
  ? new MockUsers()
  : (() => {
      const sdk = require("node-appwrite");
      const client = new sdk.Client();
      client
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
        .setProject(process.env.PROJECT_ID!)
        .setKey(process.env.API_KEY!);
      return new sdk.Users(client);
    })();

export const messaging: any = isMock
  ? new MockMessaging()
  : (() => {
      const sdk = require("node-appwrite");
      const client = new sdk.Client();
      client
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
        .setProject(process.env.PROJECT_ID!)
        .setKey(process.env.API_KEY!);
      return new sdk.Messaging(client);
    })();

export const storage: any = isMock
  ? new MockStorage()
  : (() => {
      const sdk = require("node-appwrite");
      const client = new sdk.Client();
      client
        .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
        .setProject(process.env.PROJECT_ID!)
        .setKey(process.env.API_KEY!);
      return new sdk.Storage(client);
    })();
