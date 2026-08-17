"use client";

import { useState } from "react";
import { DashboardHeader } from "./dashboard-header";
import { ClassesList } from "./instructor/classes-list";
import { AssignmentsList } from "./instructor/assignments-list";
import { CreateAssignmentForm } from "./instructor/create-assignment-form";

interface InstructorClass {
  id: string;
  name: string;
  joinCode: string;
  studentCount: number;
  createdAt: string;
}

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

interface InstructorViewProps {
  initialClasses: InstructorClass[];
  initialAssignments: InstructorAssignment[];
}

export function InstructorView({ initialClasses, initialAssignments }: InstructorViewProps) {
  const [activeTab, setActiveTab] = useState<"classes" | "assignments">("classes");
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);

  return (
    <>
      <DashboardHeader
        title="Instructor Panel"
        description="Create and manage classes, set coding assignments, and configure AI tutor parameters."
      />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 space-y-8">
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-surface-container w-max">
          <button
            onClick={() => { setActiveTab("classes"); setShowCreateAssignment(false); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "classes" ? "bg-primary text-white shadow-sm" : "text-secondary hover:text-on-surface"
            }`}
          >
            Classes ({initialClasses.length})
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === "assignments" ? "bg-primary text-white shadow-sm" : "text-secondary hover:text-on-surface"
            }`}
          >
            Assignments ({initialAssignments.length})
          </button>
        </div>

        <div className="pt-2">
          {activeTab === "classes" && <ClassesList initialClasses={initialClasses} />}

          {activeTab === "assignments" && !showCreateAssignment && (
            <AssignmentsList assignments={initialAssignments} onCreateClick={() => setShowCreateAssignment(true)} />
          )}

          {activeTab === "assignments" && showCreateAssignment && (
            <CreateAssignmentForm
              classes={initialClasses.map(c => ({ id: c.id, name: c.name }))}
              onCancel={() => setShowCreateAssignment(false)}
            />
          )}
        </div>
      </main>
    </>
  );
}
