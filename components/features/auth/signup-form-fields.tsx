import Link from "next/link";
import { PasswordInput } from "./password-input";

interface SignupFormFieldsProps {
  name: string;
  onNameChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (v: string) => void;
  isLoading: boolean;
}

export function SignupFormFields({
  name,
  onNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  isLoading,
}: SignupFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={isLoading}
          required
          className="w-full bg-surface-container-low rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm text-on-surface placeholder:text-outline-variant transition-shadow border border-transparent"
          placeholder="Ada Lovelace"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={isLoading}
          required
          className="w-full bg-surface-container-low rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm text-on-surface placeholder:text-outline-variant transition-shadow border border-transparent"
          placeholder="ada@academy.edu"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Password</label>
        <PasswordInput value={password} onChange={onPasswordChange} disabled={isLoading} required placeholder="••••••••" />
        <p className="text-[11px] text-secondary">
          At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Confirm Password</label>
        <PasswordInput
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={isLoading}
          required
          placeholder="••••••••"
        />
      </div>
    </>
  );
}

export function SignupLegalNotice() {
  return (
    <p className="text-center mt-4 text-xs text-secondary">
      By joining, you agree to our{" "}
      <Link className="text-primary hover:underline" href="/terms">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link className="text-primary hover:underline" href="/privacy">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
