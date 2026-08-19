import { describe, expect, it } from "vitest";
import { deriveNameFromEmail, getDisplayName } from "./display-name";

describe("deriveNameFromEmail", () => {
  it("splits on dots and title-cases each part", () => {
    expect(deriveNameFromEmail("john.doe@example.com")).toBe("John Doe");
  });

  it("splits on underscores and dashes", () => {
    expect(deriveNameFromEmail("jane_smith@example.com")).toBe("Jane Smith");
    expect(deriveNameFromEmail("mary-jane@example.com")).toBe("Mary Jane");
  });

  it("title-cases a single-word local part", () => {
    expect(deriveNameFromEmail("admin@example.com")).toBe("Admin");
  });

  it("normalizes all-caps or mixed-case local parts", () => {
    expect(deriveNameFromEmail("JOHN.DOE@example.com")).toBe("John Doe");
  });

  it("collapses repeated separators", () => {
    expect(deriveNameFromEmail("john..doe@example.com")).toBe("John Doe");
  });
});

describe("getDisplayName", () => {
  it("prefers the stored name when present", () => {
    expect(getDisplayName({ name: "Ada Lovelace", email: "hotnjuysi@gmail.com" })).toBe("Ada Lovelace");
  });

  it("falls back to a derived name when name is null", () => {
    expect(getDisplayName({ name: null, email: "jude.nitram08@gmail.com" })).toBe("Jude Nitram08");
  });

  it("falls back to a derived name when name is missing", () => {
    expect(getDisplayName({ email: "admin@gait.dev" })).toBe("Admin");
  });

  it("falls back to a derived name when name is an empty string", () => {
    expect(getDisplayName({ name: "  ", email: "admin@gait.dev" })).toBe("Admin");
  });
});
