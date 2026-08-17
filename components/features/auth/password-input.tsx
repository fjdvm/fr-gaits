"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function PasswordInput({ value, onChange, disabled, required, placeholder }: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="w-full bg-surface-container-low rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm text-on-surface placeholder:text-outline-variant transition-shadow border border-transparent"
      />
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        disabled={disabled}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
