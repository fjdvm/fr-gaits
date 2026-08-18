import { describe, expect, it } from "vitest";
import { validatePasswordStrength } from "./password-policy";

describe("validatePasswordStrength", () => {
  it("rejects passwords shorter than 8 characters", () => {
    const result = validatePasswordStrength("Ab1defg");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/8 characters/i);
  });

  it("rejects passwords without an uppercase letter", () => {
    const result = validatePasswordStrength("abcdefg1");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/uppercase/i);
  });

  it("rejects passwords without a lowercase letter", () => {
    const result = validatePasswordStrength("ABCDEFG1");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/lowercase/i);
  });

  it("rejects passwords without a digit", () => {
    const result = validatePasswordStrength("Abcdefgh");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/number/i);
  });

  it("rejects common weak passwords like 123456 even if they satisfy other rules", () => {
    const result = validatePasswordStrength("123456");
    expect(result.valid).toBe(false);
  });

  it("rejects common weak passwords like Password1", () => {
    const result = validatePasswordStrength("Password1");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/common/i);
  });

  it("accepts a strong password meeting all requirements", () => {
    const result = validatePasswordStrength("Sw0rdfish!23");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
