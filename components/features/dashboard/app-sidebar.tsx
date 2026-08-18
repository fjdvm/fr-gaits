"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  LayoutDashboard,
  GraduationCap,
  Settings,
  LogOut,
  ListTodo,
  Archive,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useSidebarCollapse } from "./use-sidebar-collapse";
import { SidebarClassList } from "./sidebar-class-list";
import { LogoutConfirmDialog } from "./logout-confirm-dialog";

interface SidebarClass {
  id: string;
  name: string;
  archived: boolean;
  classArchived?: boolean;
}

interface AppSidebarProps {
  role: "student" | "instructor" | "admin";
  userEmail?: string;
  userName?: string | null;
  classes?: SidebarClass[];
}

const studentMenuItems = [
  { title: "Dashboard", url: "/dashboard/student", icon: LayoutDashboard },
  { title: "To-do", url: "/dashboard/student/todo", icon: ListTodo },
  { title: "Archive", url: "/dashboard/student/archive", icon: Archive },
];

const instructorMenuItems = [
  { title: "Dashboard", url: "/dashboard/instructor", icon: LayoutDashboard },
  { title: "Submissions", url: "/dashboard/instructor/submissions", icon: GraduationCap },
  { title: "Archive", url: "/dashboard/instructor/archive", icon: Archive },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

export function AppSidebar({ role, userEmail, userName, classes = [] }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed } = useSidebarCollapse();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      setIsLoggingOut(false);
    }
  };

  return (
    <TooltipProvider>
      <aside
        className={`bg-white h-full py-8 flex flex-col justify-between border-r border-surface-container shrink-0 transition-[width] duration-200 ease-linear ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="overflow-y-auto min-h-0 flex-1">
          <div className="mb-12 flex items-center px-0">
            {collapsed ? (
              <Image
                src="/solo-logo.png"
                alt="GAITS"
                width={1254}
                height={1254}
                className="w-full h-auto"
                priority
              />
            ) : (
              <Image
                src="/logo.png"
                alt="GAITS"
                width={2172}
                height={724}
                className="w-full h-auto"
                priority
              />
            )}
          </div>

          <nav className="flex flex-col space-y-2 pr-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.url;
              const link = (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`py-4 flex items-center gap-4 rounded-r-full mr-4 transition-colors group ${
                    collapsed ? "justify-center px-0 ml-4" : "px-8"
                  } ${
                    isActive
                      ? "bg-on-surface text-white font-bold ml-0"
                      : "text-secondary hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 shrink-0 ${isActive ? "text-white" : "text-secondary"}`} />
                  {!collapsed && <span className="text-sm font-semibold">{item.title}</span>}
                </Link>
              );

              if (!collapsed) return link;

              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger render={link} />
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          <SidebarClassList role={role} classes={classes} collapsed={collapsed} />
        </div>

        <div className={`mt-auto flex flex-col gap-4 ${collapsed ? "px-3" : "px-6"}`}>
          {userEmail && !collapsed && (
            <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container flex flex-col gap-1">
              <p className="truncate text-xs font-semibold text-on-surface">{userName || userEmail}</p>
              {userName && <p className="truncate text-[10px] text-secondary">{userEmail}</p>}
              <span className="inline-block self-start rounded-full bg-primary-container px-2.5 py-0.5 text-[10px] font-bold text-on-primary-container uppercase">
                {roleLabel}
              </span>
            </div>
          )}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    aria-label="Log out"
                    className="py-3 flex items-center justify-center rounded-xl text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer w-full"
                  />
                }
              >
                <LogOut className="h-5 w-5 text-secondary shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="right">Log out</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="py-3 px-6 flex items-center gap-4 rounded-xl text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer w-full"
            >
              <LogOut className="h-5 w-5 text-secondary shrink-0" />
              <span className="text-sm font-semibold">Log out</span>
            </button>
          )}
        </div>
      </aside>

      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </TooltipProvider>
  );
}
