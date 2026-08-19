"use client";

import { useState } from "react";
import { User, Crown, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getDisplayName } from "@/lib/display-name";
import { kickStudent } from "@/app/actions/kick-student";
import { KickStudentDialog } from "./kick-student-dialog";
import type { RosterStudent, RosterInstructor } from "./types";

interface PeopleTabProps {
  classId?: string;
  instructor: RosterInstructor;
  roster: RosterStudent[];
}

export function PeopleTab({ classId, instructor, roster }: PeopleTabProps) {
  const router = useRouter();
  const [pendingKick, setPendingKick] = useState<RosterStudent | null>(null);
  const [isKicking, setIsKicking] = useState(false);

  const confirmKick = async () => {
    if (!pendingKick || !classId) return;
    setIsKicking(true);
    const result = await kickStudent(classId, pendingKick.id);
    if (result.success) {
      toast.success(`${getDisplayName(pendingKick)} removed from class`);
      setPendingKick(null);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to remove student");
    }
    setIsKicking(false);
  };

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
            className="flex items-center justify-between gap-3 p-3 bg-white border border-surface-container rounded-2xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-secondary shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{getDisplayName(student)}</p>
                <p className="text-[10px] text-secondary truncate">{student.email}</p>
              </div>
            </div>
            {classId && (
              <button
                onClick={() => setPendingKick(student)}
                title="Remove student"
                className="p-2 rounded-xl text-secondary hover:text-red-600 hover:bg-surface-container-low transition-colors cursor-pointer shrink-0"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            )}
          </div>
        ))
      )}

      <KickStudentDialog
        open={!!pendingKick}
        onOpenChange={(open) => { if (!open) setPendingKick(null); }}
        onConfirm={confirmKick}
        studentName={pendingKick ? getDisplayName(pendingKick) : ""}
        isKicking={isKicking}
      />
    </div>
  );
}
