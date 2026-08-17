"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { AuthBrandingPane, AuthMobileLogo } from "./auth-branding-pane";

export function ForgotPasswordView() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSent(true);
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

          <Link
            href="/login"
            className="text-xs font-semibold text-secondary hover:text-on-surface transition-colors flex items-center gap-1.5 mb-10"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to log in
          </Link>

          <div className="flex-grow flex flex-col justify-center max-w-sm">
            {isSent ? (
              <SentConfirmation email={email} />
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Forgot your password?</h2>
                  <p className="text-sm text-secondary">
                    Enter your email and we&apos;ll send you a link to reset it.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white font-semibold py-4 rounded-xl transition-colors duration-200 shadow-sm cursor-pointer"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
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

function SentConfirmation({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-4">
        <MailCheck className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
      <p className="text-sm text-secondary leading-relaxed">
        We sent a password reset link to <span className="font-semibold text-on-surface">{email}</span>. Follow
        the link to choose a new password.
      </p>
    </div>
  );
}
