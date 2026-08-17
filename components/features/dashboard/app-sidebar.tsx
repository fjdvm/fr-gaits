"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Trophy,
  Users,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Settings,
  LogOut,
  School,
} from "lucide-react";
import Link from "next/link";

interface AppSidebarProps {
  role: "student" | "instructor" | "admin";
  userEmail?: string;
}

const studentMenuItems = [
  { title: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard },
  { title: "Leaderboard", url: "/dashboard/student/leaderboard", icon: Trophy },
];

const instructorMenuItems = [
  { title: "Dashboard", url: "/dashboard/instructor", icon: LayoutDashboard },
  { title: "Submissions", url: "/dashboard/instructor/submissions", icon: GraduationCap },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

export function AppSidebar({ role, userEmail }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems =
    role === "student"
      ? studentMenuItems
      : role === "instructor"
        ? instructorMenuItems
        : adminMenuItems;

  const roleLabel =
    role === "student"
      ? "Student"
      : role === "instructor"
        ? "Instructor"
        : "Admin";

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-white h-full py-8 flex flex-col justify-between border-r border-surface-container shrink-0">
      <div>
        {/* Brand Logo */}
        <div className="px-8 mb-12 flex items-center gap-3">
          <School className="h-8 w-8 text-primary-container fill-primary-container" />
          <span className="text-2xl font-bold tracking-tight text-on-surface font-sans">GAITS</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-2 pr-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`py-4 px-8 flex items-center gap-4 rounded-r-full mr-4 transition-colors group ${
                  isActive
                    ? "bg-on-surface text-white font-bold ml-0"
                    : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-secondary"}`} />
                <span className="text-sm font-semibold">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="px-6 mt-auto flex flex-col gap-4">
        {userEmail && (
          <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container flex flex-col gap-1">
            <p className="truncate text-xs font-semibold text-on-surface">
              {userEmail}
            </p>
            <span className="inline-block self-start rounded-full bg-primary-container px-2.5 py-0.5 text-[10px] font-bold text-on-primary-container uppercase">
              {roleLabel}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="py-3 px-6 flex items-center gap-4 rounded-xl text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer w-full"
        >
          <LogOut className="h-5 w-5 text-secondary" />
          <span className="text-sm font-semibold">Log out</span>
        </button>
      </div>
    </aside>
  );
}
