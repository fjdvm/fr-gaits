"use client";

import { useMemo, useState } from "react";
import { BookOpen, Plus, Filter } from "lucide-react";
import { useAssignmentActions } from "./components/use-assignment-actions";
import { AssignmentCard } from "./components/assignment-card";
import { DeleteAssignmentDialog } from "@/components/features/submissions/delete-assignment-dialog";

interface InstructorAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  heartsRegenMinutes: number;
  classNames: string[];
  testCaseCount: number;
}

interface AssignmentsListProps {
  assignments: InstructorAssignment[];
  onCreateClick: () => void;
}

export function AssignmentsList({ assignments, onCreateClick }: AssignmentsListProps) {
  const { pendingDelete, isDeleting, requestDelete, cancelDelete, confirmDelete } = useAssignmentActions();
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const allClassNames = useMemo(() => {
    const names = new Set<string>();
    for (const asm of assignments) {
      for (const name of asm.classNames) {
        names.add(name);
      }
    }
    return Array.from(names).sort();
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    if (selectedClass === "all") return assignments;
    return assignments.filter((asm) => asm.classNames.includes(selectedClass));
  }, [assignments, selectedClass]);

  const groupedByClass = useMemo(() => {
    const groups: Record<string, InstructorAssignment[]> = {};
    for (const asm of filteredAssignments) {
      const classKey = selectedClass !== "all" ? selectedClass : asm.classNames[0] || "Unassigned";
      if (selectedClass === "all") {
        for (const name of asm.classNames) {
          if (!groups[name]) groups[name] = [];
          groups[name].push(asm);
        }
      } else {
        if (!groups[classKey]) groups[classKey] = [];
        groups[classKey].push(asm);
      }
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredAssignments, selectedClass]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Assignments List</h2>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold h-9 px-4 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </button>
      </div>

      {allClassNames.length > 0 && (
        <div className="flex items-center gap-2.5">
          <Filter className="h-4 w-4 text-secondary" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border border-surface-container rounded-xl px-4 py-2 text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow cursor-pointer"
          >
            <option value="all">All Classes</option>
            {allClassNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {filteredAssignments.length === 0 ? (
        <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center">
          <BookOpen className="h-12 w-12 text-secondary/30 mb-4" />
          <h3 className="font-bold text-lg">No assignments created</h3>
          <p className="text-xs text-secondary mt-1 max-w-sm">
            Create coding assignments with custom test cases for your classes.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedByClass.map(([className, classAssignments]) => (
            <section key={className}>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-bold text-on-surface">{className}</h3>
                <div className="flex-1 h-px bg-surface-container" />
                <span className="text-[10px] text-secondary font-bold">{classAssignments.length} assignment{classAssignments.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {classAssignments.map((asm) => (
                  <AssignmentCard key={asm.id} assignment={asm} onDelete={requestDelete} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <DeleteAssignmentDialog
        open={!!pendingDelete}
        onOpenChange={(open) => { if (!open) cancelDelete(); }}
        onConfirm={confirmDelete}
        assignmentTitle={pendingDelete?.title ?? ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
