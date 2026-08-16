"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export function SignupView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "instructor">("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
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
            role,
            approval_status: approvalStatus,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (data?.user) {
        toast.success("Account created successfully!");
        // Small delay for the trigger to execute
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to register on the GAIT platform
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  disabled={isLoading}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 text-left transition-all ${
                    role === "student"
                      ? "border-primary bg-zinc-50/50 dark:bg-zinc-900/50"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <span className="font-semibold text-sm">Student</span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">Solve assignments & learn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("instructor")}
                  disabled={isLoading}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 text-left transition-all ${
                    role === "instructor"
                      ? "border-primary bg-zinc-50/50 dark:bg-zinc-900/50"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <span className="font-semibold text-sm">Instructor</span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">Manage classes & view signals</span>
                </button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
