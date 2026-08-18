"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validatePasswordStrength } from "@/lib/password-policy";
import { toast } from "sonner";
import { AuthBrandingPane, AuthMobileLogo } from "./auth-branding-pane";
import { PasswordInput } from "./password-input";

export function ResetPasswordView() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password updated successfully!");
        router.push("/login");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
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

          <div className="flex-grow flex flex-col justify-center max-w-sm">
            {!isReady ? (
              <p className="text-sm text-secondary">Verifying your reset link...</p>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Set a new password</h2>
                  <p className="text-sm text-secondary">
                    Choose a strong password to secure your account.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
                      New Password
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
                      Confirm New Password
                    </label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      disabled={isLoading}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white font-semibold py-4 rounded-xl transition-colors duration-200 shadow-sm cursor-pointer"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
