"use client";

import { PanelLeftIcon, MenuIcon } from "lucide-react";
import { NotificationBell } from "@/components/features/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useSidebarCollapse } from "./use-sidebar-collapse";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const { collapsed, toggleCollapsed, toggleMobileOpen } = useSidebarCollapse();

  return (
    <header className="h-auto min-h-[100px] px-4 md:px-10 py-4 md:py-0 flex flex-row items-center justify-between gap-3 sm:gap-0 bg-white border-b border-surface-container shrink-0">
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMobileOpen}
          aria-label="Open menu"
          className="text-secondary hover:text-on-surface shrink-0 inline-flex md:hidden"
        >
          <MenuIcon className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleCollapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  className="text-secondary hover:text-on-surface shrink-0 hidden md:inline-flex"
                />
              }
            >
              <PanelLeftIcon className="size-5" />
              <span className="sr-only">Toggle Sidebar</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-on-surface font-sans truncate leading-tight">{title}</h1>
          {description && (
            <p className="hidden sm:block text-xs text-secondary mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <NotificationBell />
      </div>
    </header>
  );
}
