import { MessageSquare, BookOpen, Users, Trophy } from "lucide-react";

export type ClassTab = "stream" | "classwork" | "people" | "leaderboard";

interface ClassTabsProps {
  activeTab: ClassTab;
  onChange: (tab: ClassTab) => void;
}

export function ClassTabs({ activeTab, onChange }: ClassTabsProps) {
  return (
    <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-surface-container w-max">
      <TabButton active={activeTab === "stream"} onClick={() => onChange("stream")} icon={MessageSquare} label="Stream" />
      <TabButton active={activeTab === "classwork"} onClick={() => onChange("classwork")} icon={BookOpen} label="Classwork" />
      <TabButton active={activeTab === "people"} onClick={() => onChange("people")} icon={Users} label="People" />
      <TabButton active={activeTab === "leaderboard"} onClick={() => onChange("leaderboard")} icon={Trophy} label="Leaderboard" />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
        active ? "bg-primary text-white shadow-sm" : "text-secondary hover:text-on-surface"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
