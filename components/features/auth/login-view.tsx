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
      } else if (data?.user) {
        const role = data.user.user_metadata?.role || "student";
        const approvalStatus = data.user.user_metadata?.approval_status || "approved";

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
              Begin your quest
            </p>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full text-base font-semibold py-5" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Enter Realm"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              New to the academy?{" "}
              <Link href="/signup" className="font-bold text-primary hover:underline">
                Enlist here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
