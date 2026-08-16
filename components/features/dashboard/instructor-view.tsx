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
      <main className="p-6 space-y-6">
        <div className="flex border-b">
          <button
            onClick={() => { setActiveTab("classes"); setShowCreateAssignment(false); }}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "classes" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Classes ({initialClasses.length})
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "assignments" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Assignments ({initialAssignments.length})
          </button>
        </div>

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
      </main>
    </>
  );
}
