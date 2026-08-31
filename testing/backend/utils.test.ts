// testing/backend/utils.test.ts
// Backend utility function tests — pure Node environment tests

import { cn, parseStringify, formatDateTime, encryptKey, decryptKey } from "@/lib/utils";

describe("Backend: Utility Functions", () => {
  describe("parseStringify", () => {
    it("round-trips a complex object", () => {
      const obj = {
        name: "John",
        nested: { a: 1, b: [2, 3] },
        flag: true,
        num: 42.5,
      };
      const result = parseStringify(obj);
      expect(result).toEqual(obj);
    });

    it("handles Date objects by converting to string", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const result = parseStringify({ date });
      expect(typeof result.date).toBe("string");
      expect(result.date).toBe(date.toISOString());
    });

    it("handles Appwrite-like document objects", () => {
      const doc = {
        $id: "abc123",
        $collectionId: "patients",
        $databaseId: "default",
        $createdAt: "2024-01-01T00:00:00.000Z",
        $updatedAt: "2024-01-01T00:00:00.000Z",
        $permissions: ["read"],
        name: "Test Patient",
        email: "test@example.com",
      };
      const result = parseStringify(doc);
      expect(result.$id).toBe("abc123");
      expect(result.name).toBe("Test Patient");
    });

    it("handles empty object", () => {
      const result = parseStringify({});
      expect(result).toEqual({});
    });

    it("handles deeply nested structure", () => {
      const obj = { a: { b: { c: { d: { e: "deep" } } } } };
      const result = parseStringify(obj);
      expect(result.a.b.c.d.e).toBe("deep");
    });
  });

  describe("formatDateTime", () => {
    it("returns all four format properties", () => {
      const result = formatDateTime(new Date());
      expect(result).toHaveProperty("dateTime");
      expect(result).toHaveProperty("dateDay");
      expect(result).toHaveProperty("dateOnly");
      expect(result).toHaveProperty("timeOnly");
    });

    it("formats a known date correctly", () => {
      // Use a specific date to test formatting
      const date = new Date("2024-12-25T10:30:00");
      const result = formatDateTime(date, "UTC");
      expect(result.dateOnly).toContain("Dec");
      expect(result.dateOnly).toContain("25");
      expect(result.dateOnly).toContain("2024");
    });
  });

  describe("encryptKey / decryptKey", () => {
    it("is symmetric: decrypt(encrypt(x)) === x", () => {
      const testValues = [
        "123456",
        "admin-passkey",
        "",
        "special!@#$%^&*()",
        "very-long-passkey-1234567890",
      ];

      testValues.forEach((val) => {
        const encrypted = encryptKey(val);
        const decrypted = decryptKey(encrypted);
        expect(decrypted).toBe(val);
      });
    });

    it("produces different ciphertexts for different plaintexts", () => {
      const enc1 = encryptKey("password1");
      const enc2 = encryptKey("password2");
      expect(enc1).not.toBe(enc2);
    });

    it("encrypt produces valid base64", () => {
      const encrypted = encryptKey("test");
      const decoded = atob(encrypted);
      expect(decoded).toBe("test");
    });
  });

  describe("cn (className utility)", () => {
    it("combines multiple class names", () => {
      const result = cn("text-red-500", "text-blue-500");
      expect(result).toContain("text-blue-500");
    });

    it("removes conflicting Tailwind classes", () => {
      const result = cn("p-4", "p-8");
      expect(result).toBe("p-8");
    });
  });
});
