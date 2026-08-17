"use client";

import Link from "next/link";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Calendar, FileCode, Users, ArrowRight } from "lucide-react";

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
      <main className="flex-grow overflow-y-auto p-6 md:p-10 space-y-6">
        {assignments.length === 0 ? (
          <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center">
            <FileCode className="h-12 w-12 text-secondary/30 mb-4" />
            <h3 className="font-bold text-lg">No assignments yet</h3>
            <p className="text-xs text-secondary mt-1">Create assignments to see student submissions here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-surface-container shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-secondary border-b border-surface-container">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Assignment Title</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Class</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Due Date</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider">Submissions</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container bg-white">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                            <FileCode className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{a.title}</p>
                            <p className="text-[10px] text-secondary font-mono uppercase mt-0.5">{a.language}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary font-semibold">
                        {a.classNames.join(", ") || "No class"}
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-secondary/60" />
                          {new Date(a.dueDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-secondary font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-secondary/60" />
                          {a.submissionCount} submissions
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/dashboard/instructor/submissions/${a.id}`}>
                          <button className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface hover:text-primary rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ml-auto">
                            View Scores
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
