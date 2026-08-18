"use client";

import { SidebarCollapseContext, useSidebarCollapseState } from "./use-sidebar-collapse";

export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const value = useSidebarCollapseState();

  return (
    <SidebarCollapseContext.Provider value={value}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}
