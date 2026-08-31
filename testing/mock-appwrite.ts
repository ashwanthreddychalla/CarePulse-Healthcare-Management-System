/**
 * Mock Appwrite SDK — In-memory implementation for local testing
 *
 * This module replaces the real node-appwrite SDK with an in-memory store
 * that simulates Appwrite Databases, Users, Storage, and Messaging.
 *
 * Uses globalThis for stores so they persist across module re-loads
 * in Next.js dev mode (HMR).
 *
 * ⚠️  This does NOT prove the real Appwrite integration works.
 *     It is for local testing only.
 */

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Document {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  [key: string]: any;
}

interface User {
  $id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  $createdAt: string;
  $updatedAt: string;
}

interface SmsMessage {
  $id: string;
  content: string;
  targets: string[];
  $createdAt: string;
}

interface StoredFile {
  $id: string;
  name: string;
  mimeType: string;
  sizeOriginal: number;
  $createdAt: string;
}

// ─── In-memory stores (persisted via globalThis across HMR) ──────────────────

if (!(globalThis as any).__APPWRITE_MOCK_STORES__) {
  (globalThis as any).__APPWRITE_MOCK_STORES__ = {
    documents: new Map<string, Document[]>(),
    users: new Map<string, User>(),
    messages: [] as SmsMessage[],
    files: new Map<string, StoredFile>(),
  };
}

const stores: {
  documents: Map<string, Document[]>;
  users: Map<string, User>;
  messages: SmsMessage[];
  files: Map<string, StoredFile>;
} = (globalThis as any).__APPWRITE_MOCK_STORES__;

let idCounter = ((globalThis as any).__APPWRITE_MOCK_ID__ = ((globalThis as any).__APPWRITE_MOCK_ID__ || 0) + 1);

function uniqueId(): string {
  idCounter++;
  (globalThis as any).__APPWRITE_MOCK_ID__ = idCounter;
  return `mock-id-${Date.now()}-${idCounter}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ─── Mock Databases ──────────────────────────────────────────────────────────

function collectionKey(databaseId: string, collectionId: string): string {
  return `${databaseId}/${collectionId}`;
}

// Parse a query parameter that may be either an object { method, attribute, values }
// or a JSON string from node-appwrite's Query.equal() etc.
function parseQuery(q: any): any {
  if (!q) return null;
  if (typeof q === "string") {
    try {
      return JSON.parse(q);
    } catch {
      return null;
    }
  }
  return q;
}

function getDocs(databaseId: string, collectionId: string): Document[] {
  const key = collectionKey(databaseId, collectionId);
  if (!stores.documents.has(key)) stores.documents.set(key, []);
  return stores.documents.get(key)!;
}

export class MockDatabases {
  async createDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, any>
  ): Promise<Document> {
    const id = documentId === "unique()" || !documentId ? uniqueId() : documentId;
    const now = nowISO();
    const doc: Document = {
      $id: id,
      $collectionId: collectionId,
      $databaseId: databaseId,
      $createdAt: now,
      $updatedAt: now,
      $permissions: ["read", "write"],
      ...data,
    };
    getDocs(databaseId, collectionId).push(doc);
    return doc;
  }

  async listDocuments(
    databaseId: string,
    collectionId: string,
    queries: any[] = []
  ): Promise<{ total: number; documents: Document[] }> {
    let docs = getDocs(databaseId, collectionId);

    for (const raw of queries) {
      const q = parseQuery(raw);
      if (q && q.method === "equal") {
        const { attribute, values } = q;
        docs = docs.filter((d: any) => values.includes(d[attribute]));
      }
      if (q && q.method === "orderDesc") {
        const { attribute } = q;
        docs = [...docs].sort((a: any, b: any) => {
          const aVal = a[attribute] || "";
          const bVal = b[attribute] || "";
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        });
      }
    }

    return { total: docs.length, documents: docs };
  }

  async getDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<Document> {
    const docs = getDocs(databaseId, collectionId);
    const doc = docs.find((d) => d.$id === documentId);
    if (!doc) {
      const err: any = new Error("Document not found");
      err.code = 404;
      throw err;
    }
    return doc;
  }

  async updateDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Record<string, any>
  ): Promise<Document> {
    const docs = getDocs(databaseId, collectionId);
    const idx = docs.findIndex((d) => d.$id === documentId);
    if (idx === -1) {
      const err: any = new Error("Document not found");
      err.code = 404;
      throw err;
    }
    docs[idx] = { ...docs[idx], ...data, $updatedAt: nowISO() };
    return docs[idx];
  }

  async deleteDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ): Promise<void> {
    const docs = getDocs(databaseId, collectionId);
    const idx = docs.findIndex((d) => d.$id === documentId);
    if (idx !== -1) docs.splice(idx, 1);
  }
}

// ─── Mock Users ──────────────────────────────────────────────────────────────

export class MockUsers {
  async create(
    userId: string,
    email: string,
    phone: string,
    password: string | undefined,
    name: string
  ): Promise<User> {
    // Check for duplicate email
    for (const u of Array.from(stores.users.values())) {
      if (u.email === email) {
        const err: any = new Error("User already exists");
        err.code = 409;
        throw err;
      }
    }

    const id = userId === "unique()" || !userId ? uniqueId() : userId;
    const now = nowISO();
    const user: User = {
      $id: id,
      name,
      email,
      phone,
      status: "active",
      $createdAt: now,
      $updatedAt: now,
    };
    stores.users.set(id, user);
    return user;
  }

  async list(queries: any[] = []): Promise<{ users: User[] }> {
    let users: User[] = Array.from(stores.users.values());

    for (const raw of queries) {
      const q = parseQuery(raw);
      if (q && q.method === "equal") {
        const { attribute, values } = q;
        users = users.filter((u: User) => values.includes((u as any)[attribute]));
      }
    }

    return { users };
  }

  async get(userId: string): Promise<User> {
    const user = stores.users.get(userId);
    if (!user) {
      const err: any = new Error("User not found");
      err.code = 404;
      throw err;
    }
    return user;
  }

  async delete(userId: string): Promise<void> {
    stores.users.delete(userId);
  }
}

// ─── Mock Storage ────────────────────────────────────────────────────────────

export class MockStorage {
  async createFile(
    bucketId: string,
    fileId: string,
    file: any
  ): Promise<StoredFile> {
    const id = fileId === "unique()" || !fileId ? uniqueId() : fileId;
    const now = nowISO();
    const storedFile: StoredFile = {
      $id: id,
      name: file?.name || "unknown",
      mimeType: file?.type || "application/octet-stream",
      sizeOriginal: file?.size || 0,
      $createdAt: now,
    };
    stores.files.set(id, storedFile);
    return storedFile;
  }

  async getFile(bucketId: string, fileId: string): Promise<StoredFile> {
    const file = stores.files.get(fileId);
    if (!file) {
      const err: any = new Error("File not found");
      err.code = 404;
      throw err;
    }
    return file;
  }

  async deleteFile(bucketId: string, fileId: string): Promise<void> {
    stores.files.delete(fileId);
  }
}

// ─── Mock Messaging ──────────────────────────────────────────────────────────

export class MockMessaging {
  async createSms(
    messageId: string,
    content: string,
    topics: string[],
    targets: string[]
  ): Promise<SmsMessage> {
    const id = messageId === "unique()" || !messageId ? uniqueId() : messageId;
    const msg: SmsMessage = {
      $id: id,
      content,
      targets,
      $createdAt: nowISO(),
    };
    stores.messages.push(msg);
    return msg;
  }

  async listMessages(): Promise<{ messages: SmsMessage[] }> {
    return { messages: [...stores.messages] };
  }
}

// ─── Mock Query helper (same API as node-appwrite) ──────────────────────────

export const Query = {
  equal(attribute: string, values: any[]) {
    return { method: "equal", attribute, values };
  },
  notEqual(attribute: string, values: any[]) {
    return { method: "notEqual", attribute, values };
  },
  orderDesc(attribute: string) {
    return { method: "orderDesc", attribute };
  },
  orderAsc(attribute: string) {
    return { method: "orderAsc", attribute };
  },
  limit(limit: number) {
    return { method: "limit", limit };
  },
  offset(offset: number) {
    return { method: "offset", offset };
  },
};

// ─── Mock ID helper ─────────────────────────────────────────────────────────

export const ID = {
  unique(): string {
    return uniqueId();
  },
};

// ─── Mock InputFile helper ───────────────────────────────────────────────────

export const InputFile = {
  fromBlob(blob: Blob, fileName: string): any {
    return {
      name: fileName,
      type: blob?.type || "application/octet-stream",
      size: blob?.size || 0,
    };
  },
};

// ─── Data access helpers for tests ──────────────────────────────────────────

export function __getAllUsers(): User[] {
  return Array.from(stores.users.values());
}

export function __getAllDocuments(
  databaseId: string,
  collectionId: string
): Document[] {
  return getDocs(databaseId, collectionId);
}

export function __getAllMessages(): SmsMessage[] {
  return [...stores.messages];
}

export function __clearAllData(): void {
  stores.documents.clear();
  stores.users.clear();
  stores.messages.length = 0;
  stores.files.clear();
  idCounter = 0;
  (globalThis as any).__APPWRITE_MOCK_ID__ = 0;
}

export function mockDebugStore(): any {
  return {
    userCount: stores.users.size,
    userKeys: Array.from(stores.users.keys()),
    documentKeys: Array.from(stores.documents.keys()),
    documentCounts: Object.fromEntries(
      Array.from(stores.documents.entries()).map(([k, v]) => [k, v.length])
    ),
    messageCount: stores.messages.length,
    fileCount: stores.files.size,
  };
}

export function __seedDemoData(): void {
  __clearAllData();

  const demoUser: User = {
    $id: "demo-user-001",
    name: "John Doe",
    email: "john.e2e.test@example.com",
    phone: "+15551234567",
    status: "active",
    $createdAt: nowISO(),
    $updatedAt: nowISO(),
  };
  stores.users.set(demoUser.$id, demoUser);

  const demoPatient: Document = {
    $id: "demo-patient-001",
    $collectionId: "patients",
    $databaseId: "mock-db",
    $createdAt: nowISO(),
    $updatedAt: nowISO(),
    $permissions: ["read", "write"],
    userId: "demo-user-001",
    name: "John Doe",
    email: "john.e2e.test@example.com",
    phone: "+15551234567",
    birthDate: "1990-05-15",
    gender: "Male",
    address: "123 Main Street, New York, NY 10001",
    occupation: "Software Engineer",
    emergencyContactName: "Jane Doe",
    emergencyContactNumber: "+15559876543",
    primaryPhysician: "John Green",
    insuranceProvider: "BlueCross BlueShield",
    insurancePolicyNumber: "BC123456789",
    privacyConsent: true,
  };
  const key = collectionKey("mock-db", "patients");
  stores.documents.set(key, [demoPatient]);

  const demoAppt: Document = {
    $id: "demo-appt-001",
    $collectionId: "appointments",
    $databaseId: "mock-db",
    $createdAt: nowISO(),
    $updatedAt: nowISO(),
    $permissions: ["read", "write"],
    userId: "demo-user-001",
    patient: "demo-patient-001",
    primaryPhysician: "John Green",
    reason: "Annual check-up",
    schedule: new Date(Date.now() + 86400000).toISOString(),
    status: "pending",
    note: "Morning preferred",
    cancellationReason: null,
  };
  const apptKey = collectionKey("mock-db", "appointments");
  stores.documents.set(apptKey, [demoAppt]);
}
