"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-2 border-border">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="GAITS Logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary font-[var(--font-heading)]">
              GAITS
            </h1>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mt-1">
              Join the academy
            </p>
          </div>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wide">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="scholar@gaits.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-xs uppercase tracking-wide">
                Password
              </Label>
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
              <Label className="font-bold text-xs uppercase tracking-wide">I am a...</Label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  disabled={isLoading}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 text-left transition-all ${
                    role === "student"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <span className="font-semibold text-sm">Student</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Solve assignments & learn
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("instructor")}
                  disabled={isLoading}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-3 text-left transition-all ${
                    role === "instructor"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <span className="font-semibold text-sm">Instructor</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Manage classes & view signals
                  </span>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full text-base font-semibold py-5" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Begin Quest"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already enlisted?{" "}
              <Link href="/login" className="font-bold text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
