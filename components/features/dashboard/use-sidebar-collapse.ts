"use client";

import { createContext, useCallback, useContext, useState } from "react";

const STORAGE_KEY = "app_sidebar_collapsed";

function readStoredState(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

interface SidebarCollapseContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const SidebarCollapseContext = createContext<SidebarCollapseContextValue | null>(null);

export function useSidebarCollapseState(): SidebarCollapseContextValue {
  const [collapsed, setCollapsed] = useState(readStoredState);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return { collapsed, toggleCollapsed };
}

export function useSidebarCollapse(): SidebarCollapseContextValue {
  const context = useContext(SidebarCollapseContext);
  if (!context) {
    throw new Error("useSidebarCollapse must be used within a SidebarCollapseProvider");
  }
  return context;
}
