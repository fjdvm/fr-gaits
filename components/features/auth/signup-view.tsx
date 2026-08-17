"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { School, BookOpen, GraduationCap } from "lucide-react";

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
    <div className="bg-surface min-h-screen w-full flex items-center justify-center p-4 md:p-10 text-on-surface antialiased">
      <main className="w-full max-w-[1200px] bg-white rounded-[32px] shadow-sm flex flex-col md:flex-row overflow-hidden min-h-[700px] border border-surface-container">
        {/* Left Pane: Branding & Flavor */}
        <div className="hidden md:flex md:w-5/12 bg-surface-container relative flex-col justify-between p-12 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, var(--color-outline-variant) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12 text-primary font-bold text-2xl">
              <School className="h-8 w-8 text-primary-container fill-primary-container" />
              <span className="font-sans tracking-tight text-on-surface">GAITS</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface mb-4 leading-tight">
              Embark on your<br />academic quest.
            </h1>
            <p className="text-sm text-secondary max-w-sm leading-relaxed">
              Join the realm where knowledge is your ultimate weapon. Level up your skills, complete challenges, and master your discipline.
            </p>
          </div>
          <div className="relative z-10 w-full flex justify-center mt-8">
            <img
              className="w-full max-w-xs object-contain"
              alt="A student looking confidently toward a digital gateway"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqx_Es44THQOYHegmCt_jTvzYfUcJfm0XvL5Noik5jZIq2we16HE2zQYJR_vSxgMhTJ5ODpb6eT8-DyViSUlGqc9WLT6UF0jtYNqrqVMhFjLiGHokpBzTCzFlvFOKuEDcwfefOj8A0dZLtidwGZtv3HZDGocQ3sCXyqtF84F_Wf9upoGmwy0PPpBX-o1CjBx3BMxNuQN63hwRWHr0Z6dH0LvWRdk5JA98GkipOsf6KacBweVh6bIOW"
            />
          </div>
        </div>

        {/* Right Pane: Auth Forms */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col relative bg-white">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2 text-primary font-bold text-2xl">
              <School className="h-8 w-8 text-primary-container fill-primary-container" />
              <span className="font-sans tracking-tight text-on-surface">GAITS</span>
            </div>
          </div>

          {/* Tab Navigation */}
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

          {/* SIGN UP FORM */}
          <div className="flex-grow flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Create your character</h2>
              <p className="text-sm text-secondary">Select your class and begin the tutorial.</p>
            </div>
            <form onSubmit={handleSignup} className="space-y-6 flex-grow flex flex-col">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Select Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    disabled={isLoading}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all text-center group cursor-pointer ${
                      role === "student"
                        ? "border-primary-container bg-surface-container-low"
                        : "border-transparent bg-surface hover:border-outline-variant"
                    }`}
                  >
                    <BookOpen className={`h-8 w-8 mb-2 transition-colors ${role === "student" ? "text-primary" : "text-secondary"}`} />
                    <span className="text-sm font-semibold text-on-surface">Student</span>
                    <span className="text-xs text-secondary mt-1">Learn & earn XP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("instructor")}
                    disabled={isLoading}
                    className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all text-center group cursor-pointer ${
                      role === "instructor"
                        ? "border-primary-container bg-surface-container-low"
                        : "border-transparent bg-surface hover:border-outline-variant"
                    }`}
                  >
                    <GraduationCap className={`h-8 w-8 mb-2 transition-colors ${role === "instructor" ? "text-primary" : "text-secondary"}`} />
                    <span className="text-sm font-semibold text-on-surface">Instructor</span>
                    <span className="text-xs text-secondary mt-1">Create quests</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Email Address</label>
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
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full bg-surface-container-low rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm text-on-surface placeholder:text-outline-variant transition-shadow border border-transparent"
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
                  By joining, you agree to our <a className="text-primary hover:underline" href="#">Terms of Service</a>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
