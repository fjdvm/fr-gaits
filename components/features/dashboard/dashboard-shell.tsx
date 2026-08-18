"use client";

import { AppSidebar } from "./app-sidebar";
import { SidebarCollapseProvider } from "./sidebar-collapse-provider";

interface SidebarClass {
  id: string;
  name: string;
  archived: boolean;
}

interface DashboardShellProps {
  role: "student" | "instructor" | "admin";
  userEmail: string;
  userName?: string | null;
  classes?: SidebarClass[];
  children: React.ReactNode;
}

export function DashboardShell({ role, userEmail, userName, classes, children }: DashboardShellProps) {
  return (
    <SidebarCollapseProvider>
      <div className="flex h-screen w-full overflow-hidden bg-surface text-on-surface">
        {/* Sidebar */}
        <div className="hidden md:block shrink-0 h-full">
          <AppSidebar role={role} userEmail={userEmail} userName={userName} classes={classes} />
        </div>

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-surface">
          {children}
        </div>
      </div>
    </SidebarCollapseProvider>
  );
}
