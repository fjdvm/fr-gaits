"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Assignments List</h2>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Create Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="font-semibold">No assignments created</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create coding assignments with custom test cases for your classes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {assignments.map((asm) => (
            <Card key={asm.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-bold">{asm.title}</CardTitle>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                    {asm.language}
                  </span>
                </div>
                <CardDescription>
                  Due: {new Date(asm.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Classes:</span>
                  <span className="font-semibold">{asm.classNames.join(", ") || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Cases:</span>
                  <span className="font-semibold">{asm.testCaseCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Tutor Config:</span>
                  <span className="font-semibold">
                    {asm.heartsCount} Hearts • {asm.heartsRegenMinutes}m Cooldown
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
