import { BookOpen, GraduationCap } from "lucide-react";

interface RoleSelectorProps {
  role: "student" | "instructor";
  isLoading: boolean;
  onRoleChange: (role: "student" | "instructor") => void;
}

export function RoleSelector({ role, isLoading, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
        Select Role
      </label>
      <div className="grid grid-cols-2 gap-4">
        <RoleButton
          label="Student"
          description="Learn & earn XP"
          icon={BookOpen}
          selected={role === "student"}
          disabled={isLoading}
          onClick={() => onRoleChange("student")}
        />
        <RoleButton
          label="Instructor"
          description="Create quests"
          icon={GraduationCap}
          selected={role === "instructor"}
          disabled={isLoading}
          onClick={() => onRoleChange("instructor")}
        />
      </div>
    </div>
  );
}

function RoleButton({
  label,
  description,
  icon: Icon,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border-2 rounded-xl p-4 flex flex-col items-center justify-center transition-all text-center group cursor-pointer ${
        selected
          ? "border-primary-container bg-surface-container-low"
          : "border-transparent bg-surface hover:border-outline-variant"
      }`}
    >
      <Icon className={`h-8 w-8 mb-2 transition-colors ${selected ? "text-primary" : "text-secondary"}`} />
      <span className="text-sm font-semibold text-on-surface">{label}</span>
      <span className="text-xs text-secondary mt-1">{description}</span>
    </button>
  );
}
