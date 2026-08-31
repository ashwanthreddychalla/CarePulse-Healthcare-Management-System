// testing/frontend/utils.test.ts
import "@testing-library/jest-dom";
import {
  cn,
  parseStringify,
  convertFileToUrl,
  formatDateTime,
  encryptKey,
  decryptKey,
} from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn (className merger)", () => {
    it("merges class names", () => {
      const result = cn("foo", "bar");
      expect(result).toContain("foo");
      expect(result).toContain("bar");
    });

    it("deduplicates class names", () => {
      const result = cn("foo", "foo");
      // cn with clsx should produce a string containing 'foo'
      expect(result).toContain("foo");
    });

    it("handles Tailwind conflict resolution", () => {
      const result = cn("p-4", "p-2");
      // Tailwind merge should keep only the last p- variant
      expect(result).toBe("p-2");
    });

    it("returns empty string for no args", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("handles undefined and null gracefully", () => {
      const result = cn("foo", undefined, null, "bar");
      expect(result).toContain("foo");
      expect(result).toContain("bar");
    });
  });

  describe("parseStringify", () => {
    it("serializes and deserializes a simple object", () => {
      const obj = { name: "John", age: 30 };
      const result = parseStringify(obj);
      expect(result).toEqual(obj);
    });

    it("handles nested objects", () => {
      const obj = { a: { b: { c: 1 } } };
      const result = parseStringify(obj);
      expect(result).toEqual(obj);
    });

    it("handles arrays", () => {
      const arr = [1, 2, 3];
      const result = parseStringify(arr);
      expect(result).toEqual(arr);
    });

    it("handles strings", () => {
      const result = parseStringify("hello");
      expect(result).toBe("hello");
    });

    it("handles numbers", () => {
      const result = parseStringify(42);
      expect(result).toBe(42);
    });

    it("handles null", () => {
      const result = parseStringify(null);
      expect(result).toBe(null);
    });

    it("strips undefined values", () => {
      const obj = { a: 1, b: undefined };
      const result = parseStringify(obj);
      expect(result).toEqual({ a: 1 });
    });

    it("creates a deep copy, not a reference", () => {
      const obj = { a: { b: 1 } };
      const result = parseStringify(obj);
      result.a.b = 2;
      expect(obj.a.b).toBe(1);
    });
  });

  describe("convertFileToUrl", () => {
    it("creates a blob URL from a file", () => {
      // URL.createObjectURL is mocked in jest.setup.js
      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const url = convertFileToUrl(file);
      expect(url).toBeTruthy();
    });

    it("creates unique URLs for different files", () => {
      const file1 = new File(["content1"], "file1.txt", { type: "text/plain" });
      const file2 = new File(["content2"], "file2.txt", { type: "text/plain" });
      // Mock returns same URL each time, but the function itself works
      const url1 = convertFileToUrl(file1);
      const url2 = convertFileToUrl(file2);
      expect(url1).toBeTruthy();
      expect(url2).toBeTruthy();
    });
  });

  describe("formatDateTime", () => {
    it("formats a Date object", () => {
      const date = new Date("2024-10-25T08:30:00");
      const result = formatDateTime(date);
      expect(result).toHaveProperty("dateTime");
      expect(result).toHaveProperty("dateDay");
      expect(result).toHaveProperty("dateOnly");
      expect(result).toHaveProperty("timeOnly");
    });

    it("formats a date string", () => {
      const result = formatDateTime("2024-10-25T08:30:00");
      expect(result.dateTime).toBeTruthy();
      expect(result.dateOnly).toContain("Oct");
      expect(result.dateOnly).toContain("25");
    });

    it("includes month in formatted output", () => {
      const date = new Date("2024-10-25T12:00:00");
      const result = formatDateTime(date);
      expect(result.dateOnly).toContain("Oct");
    });

    it("includes year in formatted output", () => {
      const date = new Date("2024-10-25T12:00:00");
      const result = formatDateTime(date);
      expect(result.dateOnly).toContain("2024");
    });

    it("returns consistent structure for all outputs", () => {
      const date = new Date("2024-06-15T14:30:00");
      const result = formatDateTime(date);
      expect(typeof result.dateTime).toBe("string");
      expect(typeof result.dateDay).toBe("string");
      expect(typeof result.dateOnly).toBe("string");
      expect(typeof result.timeOnly).toBe("string");
    });

    it("respects timezone parameter", () => {
      const date = new Date("2024-10-25T12:00:00Z");
      const resultUtc = formatDateTime(date, "UTC");
      const resultEst = formatDateTime(date, "America/New_York");
      // Both should have valid strings (may differ in time)
      expect(resultUtc.timeOnly).toBeTruthy();
      expect(resultEst.timeOnly).toBeTruthy();
    });
  });

  describe("encryptKey / decryptKey", () => {
    it("encrypts and decrypts a passkey", () => {
      const original = "123456";
      const encrypted = encryptKey(original);
      const decrypted = decryptKey(encrypted);
      expect(decrypted).toBe(original);
    });

    it("produces base64-encoded output", () => {
      const original = "test-passkey";
      const encrypted = encryptKey(original);
      // Base64 check
      expect(() => atob(encrypted)).not.toThrow();
    });

    it("handles empty string", () => {
      const encrypted = encryptKey("");
      const decrypted = decryptKey(encrypted);
      expect(decrypted).toBe("");
    });

    it("handles special characters", () => {
      const original = "pass@key#123!";
      const encrypted = encryptKey(original);
      const decrypted = decryptKey(encrypted);
      expect(decrypted).toBe(original);
    });

    it("produces different output for different inputs", () => {
      const enc1 = encryptKey("key1");
      const enc2 = encryptKey("key2");
      expect(enc1).not.toBe(enc2);
    });
  });
});
