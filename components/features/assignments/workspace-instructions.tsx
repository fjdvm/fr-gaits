"use client";

import { Award } from "lucide-react";

interface SubmissionData {
  score: number;
  submittedAt: string;
}

interface WorkspaceInstructionsProps {
  title: string;
  instructorEmail: string;
  instructions: string;
  submission: SubmissionData | null;
}

export function WorkspaceInstructions({ title, instructorEmail, instructions, submission }: WorkspaceInstructionsProps) {
  return (
    <div className="w-[33%] border-r border-surface-container bg-white p-6 overflow-y-auto space-y-6 flex flex-col justify-between shrink-0">
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-on-surface leading-tight">{title}</h2>
          <p className="text-[10px] text-secondary font-semibold">Instructor: {instructorEmail}</p>
        </div>
        <div className="border-t border-surface-container pt-4 prose prose-sm max-w-none text-xs text-secondary leading-relaxed whitespace-pre-wrap">
          {instructions}
        </div>
      </div>

      {submission && (
        <div className="p-4 rounded-2xl border border-surface-container bg-primary-container/10 flex flex-col gap-2 mt-5">
          <div className="flex justify-between items-center text-primary">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Award className="h-4 w-4" /> Submission Details
            </span>
            <span className="text-xl font-extrabold text-on-surface">{submission.score}% Score</span>
          </div>
          <p className="text-[10px] text-secondary leading-normal">
            You successfully completed this assignment. Your code has been frozen.
          </p>
          <p className="text-[9px] text-secondary/60">
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
