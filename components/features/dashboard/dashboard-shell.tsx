"use client";

import { AppSidebar } from "./app-sidebar";
import { MobileSidebarDrawer } from "./mobile-sidebar-drawer";
import { SidebarCollapseProvider } from "./sidebar-collapse-provider";

interface SidebarClass {
  id: string;
  name: string;
  archived: boolean;
  classArchived?: boolean;
}

interface DashboardShellProps {
  role: "student" | "instructor" | "admin";
  userEmail: string;
  userName?: string | null;
  classes?: SidebarClass[];
  studentXp?: { totalXp: number; level: number };
  children: React.ReactNode;
}

export function DashboardShell({ role, userEmail, userName, classes, studentXp, children }: DashboardShellProps) {
  return (
    <SidebarCollapseProvider>
      <div className="flex h-screen w-full overflow-hidden bg-surface text-on-surface">
        {/* Sidebar (desktop) */}
        <div className="hidden md:block shrink-0 h-full">
          <AppSidebar role={role} userEmail={userEmail} userName={userName} classes={classes} studentXp={studentXp} />
        </div>

        {/* Sidebar (mobile drawer) */}
        <MobileSidebarDrawer role={role} userEmail={userEmail} userName={userName} classes={classes} studentXp={studentXp} />

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-surface">
          {children}
        </div>
      </div>
    </SidebarCollapseProvider>
  );
}
