"use client";

import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

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
  { title: "Classes", url: "/dashboard/instructor", icon: Users },
  { title: "Assignments", url: "/dashboard/instructor", icon: BookOpen },
  {
    title: "Submissions",
    url: "/dashboard/instructor/submissions",
    icon: GraduationCap,
  },
];

const adminMenuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Approvals", url: "/dashboard/admin", icon: ShieldCheck },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

export function AppSidebar({ role, userEmail }: AppSidebarProps) {
  const router = useRouter();

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
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/logo-sidebar.png"
            alt="Logo"
            width={160}
            height={160}
            className="rounded-md w-full h-auto"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<a href={item.url} />}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        {userEmail && (
          <div className="mb-2">
            <p className="truncate text-xs text-sidebar-foreground/70">
              {userEmail}
            </p>
            <span className="mt-1 inline-block rounded-full bg-sidebar-primary px-2 py-0.5 text-xs font-semibold text-sidebar-primary-foreground">
              {roleLabel}
            </span>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
