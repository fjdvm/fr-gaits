"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function StudentView() {
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">GAIT</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Student</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to GAIT</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            This is your student dashboard shell. You can join classes and complete assignments here.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">My Classes</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Enroll in a programming course to view assignments.
            </p>
            <button className="text-sm font-medium text-primary hover:underline">
              Join Class &rarr;
            </button>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">My Stats</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Level 1 Student • 0 XP • 0 Hearts
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
