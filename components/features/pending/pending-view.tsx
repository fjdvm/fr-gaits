"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Hourglass, Info, LogOut, RefreshCw } from "lucide-react";

export function PendingView() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error("Failed to log out");
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-8 antialiased">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary-container/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-outline-variant/20 blur-[120px]" />
      </div>

      {/* Main Container */}
      <main className="z-10 w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg rounded-[32px] p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-50" />
          
          {/* Brand Logo */}
          <div className="mb-12 flex items-center justify-center">
            <span className="font-sans text-2xl text-primary font-bold tracking-tight">GAITS</span>
            <span className="ml-2 text-xs font-semibold text-secondary bg-surface-container-high px-2 py-1 rounded-md">Instructor</span>
          </div>

          {/* Icon / Illustration Area */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            {/* Center Icon */}
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center z-10 relative border border-surface-container">
              <Hourglass className="h-10 w-10 text-primary animate-pulse" />
              {/* Status badge */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-container rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[10px] text-on-primary-container font-bold">...</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl font-bold text-on-surface">Awaiting Admin Approval</h1>
            <p className="text-sm text-secondary max-w-sm mx-auto leading-relaxed">
              Your instructor account is currently under review by our administration team. This process typically takes 1-2 business days.
            </p>
          </div>

          {/* Next Steps / Info */}
          <div className="w-full bg-surface-container-low rounded-xl p-5 text-left border border-surface-container-high mb-8">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center">
              <Info className="mr-2 text-primary h-5 w-5" />
              What happens next?
            </h3>
            <ul className="space-y-3 text-xs text-secondary leading-relaxed">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1.5 mr-3 shrink-0" />
                We'll verify your credentials and provided information.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1.5 mr-3 shrink-0" />
                You'll receive an email notification once approved.
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container mt-1.5 mr-3 shrink-0" />
                After approval, you can start creating courses immediately.
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.refresh()}
              disabled={isLoggingOut}
              className="w-full py-3 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Check Status
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full py-3 bg-transparent hover:bg-surface-container text-secondary hover:text-on-surface rounded-xl font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
