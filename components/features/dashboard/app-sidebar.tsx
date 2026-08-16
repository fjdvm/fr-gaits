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
  { title: "Submissions", url: "/dashboard/instructor/submissions", icon: GraduationCap },
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
    role === "student" ? "Student" : role === "instructor" ? "Instructor" : "Admin";

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
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="GAITS Logo"
            width={36}
            height={36}
            className="rounded-md"
          />
          <span className="text-lg font-bold tracking-tight font-[var(--font-heading)]">
            GAITS
          </span>
          <span className="ml-auto rounded-full bg-sidebar-primary px-2 py-0.5 text-xs font-semibold text-sidebar-primary-foreground">
            {roleLabel}
          </span>
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
          <p className="mb-2 truncate text-xs text-sidebar-foreground/70">{userEmail}</p>
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
