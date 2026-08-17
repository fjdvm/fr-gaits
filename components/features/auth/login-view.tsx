"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { School, MessageSquare } from "lucide-react";

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
              <p className="text-sm text-secondary">Continue your journey and maintain your streak.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6 flex-grow">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Email Address</label>
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
                  <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">Password</label>
                  <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
                </div>
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white font-semibold py-4 rounded-xl transition-colors duration-200 shadow-sm mt-8 cursor-pointer"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <div className="mt-8">
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-surface-container"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-secondary font-medium">Or access via</span>
                <div className="flex-grow border-t border-surface-container"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  type="button"
                  className="flex items-center justify-center space-x-2 border border-outline-variant rounded-xl py-3 hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <img
                    className="w-5 h-5"
                    alt="Google"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjIbwSfIW_POJ1CGFFlao1-xHZ2Ed60TLnRMgRTuuxDUOCAhs1YKwNb4IJzVytfOoFYumdSd6WD2hiT24Lo-ZCIqOQht7YT4xYec7rUjWNjF_odtqkELYMXESYgkNp7tCTp0zOff6kSSn-4rEpfUnC-fmThON8A9ffoUkoU6xzRBN3ZWsOJs--RTgOJvmuBQhBLiLnBG9ZbmHncHc8KSWF8bsC_l550XmhYuH0nIahptAl9O5TX4Xt"
                  />
                  <span className="text-xs font-semibold">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center space-x-2 border border-outline-variant rounded-xl py-3 hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-5 w-5 text-secondary" />
                  <span className="text-xs font-semibold">Institution SSO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
