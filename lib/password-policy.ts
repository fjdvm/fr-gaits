const COMMON_WEAK_PASSWORDS = new Set([
  "123456",
  "12345678",
  "123456789",
  "password",
  "password1",
  "qwerty",
  "qwerty123",
  "11111111",
  "abc12345",
  "letmein",
  "welcome",
  "admin123",
  "iloveyou",
]);

export interface PasswordValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must include at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must include at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must include at least one number" };
  }
  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { valid: false, error: "This password is too common, please choose a stronger one" };
  }

  return { valid: true };
}
