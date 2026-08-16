"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";

interface AssignmentSummary {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  classNames: string[];
  submissionCount: number;
}

interface SubmissionsListViewProps {
  assignments: AssignmentSummary[];
}

export function SubmissionsListView({ assignments }: SubmissionsListViewProps) {
  return (
    <>
      <DashboardHeader title="Student Submissions" description="View scores and submission details for your assignments." />
      <main className="p-6 space-y-6">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="font-semibold">No assignments yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Create assignments to see student submissions here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((a) => (
              <Link key={a.id} href={`/dashboard/instructor/submissions/${a.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{a.title}</CardTitle>
                    <CardDescription>{a.classNames.join(", ") || "No class"} • {a.language}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Submissions:</span>
                      <span className="font-semibold">{a.submissionCount}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Due:</span>
                      <span>{new Date(a.dueDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
