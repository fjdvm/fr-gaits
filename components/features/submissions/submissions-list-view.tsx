"use client";

import { useMemo, useState } from "react";
import { FileCode } from "lucide-react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { ClassFilter } from "./class-filter";
import { AssignmentsTable } from "./assignments-table";

interface AssignmentSummary {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  classes: { id: string; name: string }[];
  submissionCount: number;
}

interface ClassOption {
  id: string;
  name: string;
}

interface SubmissionsListViewProps {
  assignments: AssignmentSummary[];
  classes: ClassOption[];
}

const UNASSIGNED_CLASS_ID = "unassigned";

export function SubmissionsListView({ assignments, classes }: SubmissionsListViewProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");

  const groups = useMemo(() => {
    const byClass = new Map<string, { id: string; name: string; assignments: AssignmentSummary[] }>();

    for (const cls of classes) {
      byClass.set(cls.id, { id: cls.id, name: cls.name, assignments: [] });
    }

    for (const assignment of assignments) {
      if (assignment.classes.length === 0) {
        if (!byClass.has(UNASSIGNED_CLASS_ID)) {
          byClass.set(UNASSIGNED_CLASS_ID, { id: UNASSIGNED_CLASS_ID, name: "No class", assignments: [] });
        }
        byClass.get(UNASSIGNED_CLASS_ID)!.assignments.push(assignment);
        continue;
      }
      for (const cls of assignment.classes) {
        if (!byClass.has(cls.id)) {
          byClass.set(cls.id, { id: cls.id, name: cls.name, assignments: [] });
        }
        byClass.get(cls.id)!.assignments.push(assignment);
      }
    }

    const all = Array.from(byClass.values()).filter((g) => g.assignments.length > 0);
    return selectedClassId === "all" ? all : all.filter((g) => g.id === selectedClassId);
  }, [assignments, classes, selectedClassId]);

  return (
    <>
      <DashboardHeader title="Student Submissions" description="View scores and submission details for your assignments." />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-10">
          <div className="flex justify-end">
            <ClassFilter classes={classes} selectedClassId={selectedClassId} onChange={setSelectedClassId} />
          </div>
          {groups.length === 0 ? (
            <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center">
              <FileCode className="h-12 w-12 text-secondary/30 mb-4" />
              <h3 className="font-bold text-lg">No assignments yet</h3>
              <p className="text-xs text-secondary mt-1">Create assignments to see student submissions here.</p>
            </div>
          ) : (
            groups.map((group, index) => (
              <section key={group.id}>
                {index > 0 && <div className="border-t border-surface-container mb-10" />}
                <h2 className="text-lg font-bold text-on-surface mb-4">{group.name}</h2>
                <AssignmentsTable assignments={group.assignments} />
              </section>
            ))
          )}
        </div>
      </main>
    </>
  );
}
