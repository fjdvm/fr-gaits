"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Layers } from "lucide-react";
import { CreateAssignmentForm } from "@/components/features/dashboard/instructor/create-assignment-form";

interface ClassworkAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  testCaseCount: number;
  isSharedWithOtherClasses: boolean;
}

interface ClassworkTabProps {
  classId: string;
  className: string;
  assignments: ClassworkAssignment[];
}

export function ClassworkTab({ classId, className, assignments }: ClassworkTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (showCreateForm) {
    return (
      <CreateAssignmentForm
        classes={[{ id: classId, name: className }]}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> Create Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-xs text-secondary italic text-center py-10">No assignments in this class yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((asm) => (
            <Link
              key={asm.id}
              href={`/dashboard/instructor/submissions/${asm.id}`}
              className="flex items-center justify-between p-4 bg-white border border-surface-container rounded-2xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate flex items-center gap-2">
                    {asm.title}
                    {asm.isSharedWithOtherClasses && (
                      <span title="Also assigned to other classes" className="text-secondary">
                        <Layers className="h-3 w-3" />
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-secondary">
                    {asm.language} · Due {new Date(asm.dueDate).toLocaleDateString()} · {asm.testCaseCount} test cases
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
