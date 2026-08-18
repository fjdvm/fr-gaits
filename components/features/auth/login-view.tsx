"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isEmailUnconfirmed } from "@/lib/auth-response";
import { toast } from "sonner";
import Link from "next/link";
import { AuthBrandingPane, AuthMobileLogo } from "./auth-branding-pane";
import { PasswordInput } from "./password-input";

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else if (data?.user && isEmailUnconfirmed(data.user)) {
        await supabase.auth.signOut();
        toast.error("Please confirm your email before logging in. Check your inbox for the confirmation link.");
      } else if (data?.user) {
        const role = data.user.user_metadata?.role || "student";
        const approvalStatus =
          data.user.user_metadata?.approval_status || "approved";

        toast.success("Welcome back!");

        if (role === "instructor" && approvalStatus === "pending") {
          router.push("/pending-approval");
        } else {
          router.push(`/dashboard/${role}`);
        }
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred during login");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen w-full flex items-center justify-center p-4 md:p-10 text-on-surface antialiased">
      <main className="w-full max-w-[1200px] bg-white rounded-[32px] shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[700px] border border-surface-container">
        <AuthBrandingPane />

        {/* Right Pane: Auth Forms */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col relative bg-white">
          {/* Mobile Logo */}
          <AuthMobileLogo />

          {/* Tab Navigation */}
          <div className="flex space-x-8 mb-10 border-b border-surface-container pb-2">
            <button className="text-base font-semibold pb-2 border-b-2 border-primary-container text-on-surface transition-colors">
              Log In
            </button>
            <Link
              href="/signup"
              className="text-base font-semibold pb-2 border-b-2 border-transparent text-secondary hover:text-on-surface transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* LOGIN FORM */}
          <div className="flex-grow flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-sm text-secondary">
                Continue your journey and maintain your streak.
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6 flex-grow">
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
                  placeholder="scholar@academy.edu"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    className="text-xs font-semibold text-primary hover:underline"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  disabled={isLoading}
                  required
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white font-semibold py-4 rounded-xl transition-colors duration-200 shadow-sm mt-8 cursor-pointer"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            {/* SSO buttons removed */}
          </div>
        </div>
      </main>
    </div>
  );
}
