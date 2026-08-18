"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { School, BookOpen, ChevronRight, LogOut } from "lucide-react";
import { leaveClass } from "@/app/actions/leave-class";

export interface EnrolledClass {
  id: string;
  name: string;
  joinCode: string;
  instructorEmail: string;
  enrolledAt: string;
  archived: boolean;
  classArchived?: boolean;
  assignments: { id: string; title: string; language: string; dueDate: string; status: string }[];
}

interface StudentClassCardProps {
  cls: EnrolledClass;
}

export function StudentClassCard({ cls }: StudentClassCardProps) {
  const router = useRouter();

  const handleLeave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Leave "${cls.name}"? You'll need the join code to enroll again.`)) return;
    const result = await leaveClass(cls.id);
    if (result.success) {
      toast.success("You left the class");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to leave class");
    }
  };

  return (
    <Link
      href={`/dashboard/student/classes/${cls.id}`}
      className="bg-white border border-surface-container rounded-3xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow group relative overflow-hidden"
    >
      <div className="w-full sm:w-48 h-32 bg-surface-container-low rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary-container/5" />
        <School className="h-12 w-12 text-primary" />
      </div>
      <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
        <div>
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{cls.name}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {cls.classArchived && (
                <span className="text-[10px] font-bold uppercase text-secondary/70 border border-surface-container rounded px-1.5 py-0.5">
                  Archived by instructor
                </span>
              )}
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-surface-container rounded text-secondary">
                Code: {cls.joinCode}
              </span>
            </div>
          </div>
          <p className="text-xs text-secondary">
            Instructor: <span className="font-semibold">{cls.instructorEmail}</span>
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <BookOpen className="h-4 w-4" />
            {cls.assignments.length === 0 ? "No assignments yet" : `${cls.assignments.length} assignment${cls.assignments.length === 1 ? "" : "s"}`}
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <button
            onClick={handleLeave}
            className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Leave
          </button>
        </div>
      </div>
    </Link>
  );
}
