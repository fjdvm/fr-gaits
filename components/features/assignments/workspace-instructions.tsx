"use client";

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

function getScoreColorClass(score: number) {
  if (score >= 90) return "text-green-700 bg-green-50 border-green-200";
  if (score >= 70) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}

export function WorkspaceInstructions({ title, instructorEmail, instructions, submission }: WorkspaceInstructionsProps) {
  return (
    <div className="w-[33%] border-r border-border bg-card/50 p-5 overflow-y-auto space-y-5 flex flex-col justify-between shrink-0">
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
          <p className="text-[10px] text-muted-foreground">Instructor: {instructorEmail}</p>
        </div>
        <div className="border-t border-border pt-3 prose max-w-none text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {instructions}
        </div>
      </div>

      {submission && (
        <div className={`p-3.5 rounded-lg border flex flex-col gap-1.5 mt-5 ${getScoreColorClass(submission.score)}`}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider">Submission Results</span>
            <span className="text-xl font-extrabold">{submission.score}%</span>
          </div>
          <p className="text-[10px] opacity-80 leading-normal">
            You successfully completed this assignment. Your code has been frozen.
          </p>
          <p className="text-[9px] opacity-60">
            Submitted: {new Date(submission.submittedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
