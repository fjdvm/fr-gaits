"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validatePasswordStrength } from "@/lib/password-policy";
import { toast } from "sonner";
import Link from "next/link";
import { AuthBrandingPane, AuthMobileLogo } from "./auth-branding-pane";
import { RoleSelector } from "./role-selector";
import { PasswordInput } from "./password-input";

export function SignupView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      toast.error(passwordCheck.error);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const approvalStatus = role === "instructor" ? "pending" : "approved";

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            role,
            approval_status: approvalStatus,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (data?.user) {
        toast.success("Account created successfully!");
        setTimeout(() => {
          if (role === "instructor") {
            router.push("/pending-approval");
          } else {
            router.push("/dashboard/student");
          }
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      toast.error("An unexpected error occurred during signup");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen w-full flex items-center justify-center p-4 md:p-10 text-on-surface antialiased">
      <main className="w-full max-w-[1200px] bg-white rounded-[32px] shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[700px] border border-surface-container">
        <AuthBrandingPane />

        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col relative bg-white">
          <AuthMobileLogo />

          <div className="flex space-x-8 mb-10 border-b border-surface-container pb-2">
            <Link
              href="/login"
              className="text-base font-semibold pb-2 border-b-2 border-transparent text-secondary hover:text-on-surface transition-colors"
            >
              Log In
            </Link>
            <button className="text-base font-semibold pb-2 border-b-2 border-primary-container text-on-surface transition-colors">
              Sign Up
            </button>
          </div>

          <div className="flex-grow flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Create your character</h2>
              <p className="text-sm text-secondary">
                Select your class and begin the tutorial.
              </p>
            </div>
            <form onSubmit={handleSignup} className="space-y-6 flex-grow flex flex-col">
              <RoleSelector role={role} isLoading={isLoading} onRoleChange={setRole} />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm text-on-surface placeholder:text-outline-variant transition-shadow border border-transparent"
                  placeholder="Ada Lovelace"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm text-on-surface placeholder:text-outline-variant transition-shadow border border-transparent"
                  placeholder="ada@academy.edu"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  disabled={isLoading}
                  required
                  placeholder="••••••••"
                />
                <p className="text-[11px] text-secondary">
                  At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                  Confirm Password
                </label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  disabled={isLoading}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="mt-auto pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white font-semibold py-4 rounded-xl transition-colors duration-200 shadow-sm cursor-pointer"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
                <p className="text-center mt-4 text-xs text-secondary">
                  By joining, you agree to our{" "}
                  <Link className="text-primary hover:underline" href="/terms">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link className="text-primary hover:underline" href="/privacy">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
