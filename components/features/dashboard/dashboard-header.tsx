import { Bell, Search, User } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  return (
    <header className="h-[100px] px-6 md:px-10 flex justify-between items-center bg-white border-b border-surface-container shrink-0">
      <div className="flex items-end gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface font-sans">{title}</h1>
          {description && (
            <p className="text-xs text-secondary mt-0.5">{description}</p>
          )}
        </div>
        {children}
      </div>

      <div className="flex items-center gap-6">
        {/* Search & Notifications placeholders */}
        <div className="flex gap-4">
          <button className="text-secondary hover:text-on-surface transition-colors cursor-pointer">
            <Search className="h-5 w-5" />
          </button>
          <button className="text-secondary hover:text-on-surface transition-colors relative cursor-pointer">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary-container rounded-full border border-white"></span>
          </button>
        </div>

        {/* User avatar placeholder */}
        <div className="flex items-center gap-3 pl-6 border-l border-surface-container">
          <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center border border-surface-container">
            <User className="h-5 w-5 text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
