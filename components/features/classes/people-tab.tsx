import { User, Crown } from "lucide-react";
import type { RosterStudent, RosterInstructor } from "./types";
import { getDisplayName } from "@/lib/display-name";

interface PeopleTabProps {
  instructor: RosterInstructor;
  roster: RosterStudent[];
}

export function PeopleTab({ instructor, roster }: PeopleTabProps) {
  return (
    <div className="max-w-3xl w-full space-y-2">
      <p className="text-xs font-bold text-secondary uppercase tracking-wide px-1">Instructor</p>
      <div className="flex items-center gap-3 p-3 bg-white border border-surface-container rounded-2xl">
        <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0">
          <Crown className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{getDisplayName(instructor)}</p>
          <p className="text-[10px] text-secondary">{instructor.email}</p>
        </div>
      </div>

      <div className="border-t border-surface-container my-4" />

      <p className="text-xs font-bold text-secondary uppercase tracking-wide px-1">
        Students {roster.length > 0 && `(${roster.length})`}
      </p>
      {roster.length === 0 ? (
        <p className="text-xs text-secondary italic text-center py-10">No students enrolled yet.</p>
      ) : (
        roster.map((student) => (
          <div
            key={student.id}
            className="flex items-center gap-3 p-3 bg-white border border-surface-container rounded-2xl"
          >
            <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-secondary shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">{getDisplayName(student)}</p>
              <p className="text-[10px] text-secondary">{student.email}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
