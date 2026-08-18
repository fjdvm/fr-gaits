import { describe, expect, it } from "vitest";
import { isEmailAlreadyRegistered, isEmailUnconfirmed } from "./auth-response";

describe("isEmailAlreadyRegistered", () => {
  it("returns true when signUp returns a user with an empty identities array", () => {
    const user = { id: "u1", identities: [] };
    expect(isEmailAlreadyRegistered(user)).toBe(true);
  });

  it("returns false when signUp returns a user with a new identity", () => {
    const user = { id: "u1", identities: [{ id: "i1" }] };
    expect(isEmailAlreadyRegistered(user)).toBe(false);
  });

  it("returns false when identities is undefined (unexpected shape)", () => {
    const user = { id: "u1" };
    expect(isEmailAlreadyRegistered(user)).toBe(false);
  });

  it("returns false for a null user", () => {
    expect(isEmailAlreadyRegistered(null)).toBe(false);
  });
});

describe("isEmailUnconfirmed", () => {
  it("returns true when email_confirmed_at is null", () => {
    const user = { id: "u1", email_confirmed_at: null };
    expect(isEmailUnconfirmed(user)).toBe(true);
  });

  it("returns true when email_confirmed_at is undefined", () => {
    const user = { id: "u1" };
    expect(isEmailUnconfirmed(user)).toBe(true);
  });

  it("returns false when email_confirmed_at is set", () => {
    const user = { id: "u1", email_confirmed_at: "2026-01-01T00:00:00.000Z" };
    expect(isEmailUnconfirmed(user)).toBe(false);
  });

  it("returns false for a null user (nothing to flag as unconfirmed)", () => {
    expect(isEmailUnconfirmed(null)).toBe(false);
  });
});
