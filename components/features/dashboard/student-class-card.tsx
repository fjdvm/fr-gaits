"use client";

import Link from "next/link";
import { School, BookOpen, ChevronRight } from "lucide-react";

export interface EnrolledClass {
  id: string;
  name: string;
  joinCode: string;
  instructorEmail: string;
  enrolledAt: string;
  archived: boolean;
  assignments: { id: string; title: string; language: string; dueDate: string; status: string }[];
}

interface StudentClassCardProps {
  cls: EnrolledClass;
}

export function StudentClassCard({ cls }: StudentClassCardProps) {
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
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{cls.name}</h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-surface-container rounded text-secondary shrink-0">
              Code: {cls.joinCode}
            </span>
          </div>
          <p className="text-xs text-secondary">
            Instructor: <span className="font-semibold">{cls.instructorEmail}</span>
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary">
          <BookOpen className="h-4 w-4" />
          {cls.assignments.length === 0 ? "No assignments yet" : `${cls.assignments.length} assignment${cls.assignments.length === 1 ? "" : "s"}`}
          <ChevronRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
