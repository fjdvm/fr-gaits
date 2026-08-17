import { User } from "lucide-react";
import type { RosterStudent } from "./types";

interface PeopleTabProps {
  roster: RosterStudent[];
}

export function PeopleTab({ roster }: PeopleTabProps) {
  if (roster.length === 0) {
    return <p className="text-xs text-secondary italic text-center py-10">No students enrolled yet.</p>;
  }

  return (
    <div className="max-w-3xl space-y-2">
      {roster.map((student) => (
        <div
          key={student.id}
          className="flex items-center gap-3 p-3 bg-white border border-surface-container rounded-2xl"
        >
          <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-secondary shrink-0">
            <User className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-on-surface">{student.email}</p>
        </div>
      ))}
    </div>
  );
}
