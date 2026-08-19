"use client";

import Link from "next/link";
import { BarChart3, CheckCircle2, AlertCircle, Clock, Calendar, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { getDisplayName } from "@/lib/display-name";

interface StudentRow {
  studentId: string;
  email: string;
  name: string | null;
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
  // Sort students by score (null/missing scores at the bottom) to calculate rank
  const sortedStudents = [...students].sort((a, b) => {
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

  const totalStudents = students.length;
  const submissionCount = students.filter((s) => s.hasSubmission).length;
  const missingCount = totalStudents - submissionCount;

  // Calculate average score of graded students
  const gradedStudents = students.filter((s) => s.score !== null);
  const averageScore = gradedStudents.length > 0
    ? Math.round(gradedStudents.reduce((sum, s) => sum + (s.score || 0), 0) / gradedStudents.length)
    : 0;

  return (
    <>
      <DashboardHeader title={`Submissions: ${assignmentTitle}`} description="Review student submissions and performance metrics." />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-8">
        {/* Summary Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm flex flex-col justify-between group">
            <div className="flex items-center gap-3 mb-4 text-secondary">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Class Average</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-on-surface">{averageScore}</span>
              <span className="text-xs text-secondary font-bold">%</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${averageScore}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm flex flex-col justify-between group">
            <div className="flex items-center gap-3 mb-4 text-secondary">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Submission Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-on-surface">{submissionCount}</span>
              <span className="text-xs text-secondary font-bold">/ {totalStudents} Students</span>
            </div>
            <p className="text-[10px] text-secondary mt-4 flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span> {submissionCount} Completed
            </p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/5 rounded-full blur-xl"></div>
            <div className="flex items-center gap-3 mb-4 text-secondary relative z-10">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Missing Submissions</span>
            </div>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-3xl font-extrabold text-on-surface">{missingCount}</span>
              <span className="text-xs text-secondary font-bold">Students</span>
            </div>
            <p className="text-[10px] text-secondary mt-4 flex items-center gap-1.5 font-semibold relative z-10">
              <span className="w-2 h-2 rounded-full bg-destructive/20"></span> {missingCount} Outstanding
            </p>
          </div>
        </section>

        {/* Detailed Leaderboard Table */}
        <div className="bg-white rounded-[24px] border border-surface-container shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-container bg-surface-container-low/50 grid grid-cols-12 gap-4 items-center font-bold text-xs text-secondary uppercase tracking-wider">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-4">Student</div>
            <div className="col-span-4">Score</div>
            <div className="col-span-3 text-right">Status</div>
          </div>

          <div className="divide-y divide-surface-container">
            {sortedStudents.map((s, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3 && s.hasSubmission;
              const displayName = getDisplayName(s);
              const displayInitials = displayName.substring(0, 2).toUpperCase();

              return (
                <div
                  key={s.studentId}
                  className={`px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors hover:bg-surface-container-low/30 relative ${
                    isTopThree ? "bg-primary-container/5" : ""
                  }`}
                >
                  {isTopThree && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  )}

                  {/* Rank Column */}
                  <div className="col-span-1 flex justify-center">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isTopThree
                          ? "bg-primary text-white"
                          : "text-secondary font-semibold"
                      }`}
                    >
                      {s.hasSubmission ? rank : "-"}
                    </span>
                  </div>

                  {/* Student Column */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-xs font-bold text-secondary">
                      {displayInitials}
                    </div>
                    <div className="truncate">
                      <Link
                        href={`/dashboard/instructor/submissions/${assignmentId}/${s.studentId}`}
                        className="text-sm font-bold text-on-surface hover:text-primary transition-colors block truncate"
                      >
                        {displayName}
                      </Link>
                      <p className="text-[10px] text-secondary truncate mt-0.5">{s.email}</p>
                    </div>
                  </div>

                  {/* Score Column */}
                  <div className="col-span-4 flex items-center gap-4">
                    <span className="text-sm font-bold text-on-surface w-12 text-right">
                      {s.score !== null ? `${s.score}%` : "—"}
                    </span>
                    <div className="flex-grow h-2 bg-surface-container rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${s.score !== null ? s.score : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Column */}
                  <div className="col-span-3 flex justify-end">
                    {s.hasSubmission ? (
                      <Link href={`/dashboard/instructor/submissions/${assignmentId}/${s.studentId}`}>
                        <button className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-bold text-[10px] inline-flex items-center gap-1.5 transition-colors cursor-pointer">
                          Graded
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </Link>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-surface-container text-secondary font-semibold text-[10px] inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Missing
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
