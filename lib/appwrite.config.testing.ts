/**
 * Appwrite Configuration — TESTING MODE
 *
 * This module replaces lib/appwrite.config.ts during tests.
 * It provides in-memory mock implementations of Databases, Users,
 * Storage, and Messaging instead of connecting to real Appwrite.
 *
 * ⚠️  This does NOT prove the real Appwrite integration works.
 *     It is for local testing only.
 */

import {
  MockDatabases,
  MockUsers,
  MockStorage,
  MockMessaging,
} from "../testing/mock-appwrite";

// Hardcoded mock IDs — these are the IDs the mock stores use internally
export const ENDPOINT = "https://mock-appwrite.io/v1";
export const PROJECT_ID = "mock-project-id";
export const API_KEY = "mock-api-key";
export const DATABASE_ID = "mock-db";
export const PATIENT_COLLECTION_ID = "patients";
export const DOCTOR_COLLECTION_ID = "doctors";
export const APPOINTMENT_COLLECTION_ID = "appointments";
export const BUCKET_ID = "mock-bucket";

// In-memory service instances
export const databases = new MockDatabases() as any;
export const users = new MockUsers() as any;
export const storage = new MockStorage() as any;
export const messaging = new MockMessaging() as any;
