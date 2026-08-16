"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { joinClass } from "@/app/actions/join-class";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EnrolledClass {
  id: string;
  name: string;
  joinCode: string;
  instructorEmail: string;
  enrolledAt: string;
}

interface StudentViewProps {
  initialClasses: EnrolledClass[];
}

export function StudentView({ initialClasses }: StudentViewProps) {
  const router = useRouter();
  const [classes, setClasses] = useState<EnrolledClass[]>(initialClasses);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
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

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.trim() === "") {
      toast.error("Please enter a join code");
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinClass(joinCode);
      if (result.success) {
        toast.success(`Successfully joined class: ${result.className}!`);
        setJoinCode("");
        router.refresh();
        // Wait a small moment for server component data refresh
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        toast.error(result.error || "Failed to join class");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsJoining(false);
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

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Access your classes, complete assignments, and track your gamification progress.
            </p>
          </div>
          
          <Card className="w-full md:w-auto shadow-sm border border-zinc-200 dark:border-zinc-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-semibold">Join a New Class</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <form onSubmit={handleJoinClass} className="flex gap-2">
                <Input
                  placeholder="CODE12"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-32 uppercase"
                  disabled={isJoining}
                  maxLength={6}
                />
                <Button type="submit" size="sm" disabled={isJoining}>
                  {isJoining ? "Joining..." : "Join"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">My Classes</h2>
          
          {classes.length === 0 ? (
            <Card className="border border-zinc-200 dark:border-zinc-800">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-zinc-300 mb-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21m-2.25 0h20.25"
                  />
                </svg>
                <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">Not enrolled in any classes</h3>
                <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                  Enter a 6-character join code provided by your instructor in the box above to enroll.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((cls) => (
                <Card key={cls.id} className="shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{cls.name}</CardTitle>
                    <CardDescription>Instructor: {cls.instructorEmail}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex justify-between items-center">
                      <span>Joined: {new Date(cls.enrolledAt).toLocaleDateString()}</span>
                      <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
                        {cls.joinCode}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
