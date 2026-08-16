"use client";

import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";

interface StudentRow {
  studentId: string;
  email: string;
  score: number | null;
  submittedAt: string | null;
  hasSubmission: boolean;
}

interface AssignmentScoreTableProps {
  assignmentId: string;
  assignmentTitle: string;
  students: StudentRow[];
}

export function AssignmentScoreTable({ assignmentId, assignmentTitle, students }: AssignmentScoreTableProps) {
  return (
    <>
      <DashboardHeader title={`Submissions: ${assignmentTitle}`} description="View all student scores for this assignment." />
      <main className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Table ({students.length} students)</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students enrolled in classes assigned to this assignment.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.studentId}>
                        <TableCell>
                          <Link href={`/dashboard/instructor/submissions/${assignmentId}/${s.studentId}`} className="font-medium text-primary hover:underline">
                            {s.email}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          {s.hasSubmission ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Submitted</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Not Submitted</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{s.score !== null ? `${s.score}%` : "—"}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
