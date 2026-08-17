"use client";

import { AppSidebar } from "./app-sidebar";

interface DashboardShellProps {
  role: "student" | "instructor" | "admin";
  userEmail: string;
  children: React.ReactNode;
}

export function DashboardShell({ role, userEmail, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-surface text-on-surface">
      {/* Sidebar */}
      <div className="hidden md:block shrink-0">
        <AppSidebar role={role} userEmail={userEmail} />
      </div>
      
      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {children}
      </div>
    </div>
  );
}
