"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "./app-sidebar";

interface DashboardShellProps {
  role: "student" | "instructor" | "admin";
  userEmail: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, userEmail, children }: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar role={role} userEmail={userEmail} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
