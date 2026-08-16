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
  if (score >= 90) return "text-emerald-400 bg-emerald-950/30 border-emerald-800/50";
  if (score >= 70) return "text-amber-400 bg-amber-950/30 border-amber-800/50";
  return "text-rose-400 bg-rose-950/30 border-rose-800/50";
}

export function WorkspaceInstructions({ title, instructorEmail, instructions, submission }: WorkspaceInstructionsProps) {
  return (
    <div className="w-[33%] border-r border-zinc-800 bg-zinc-900/30 p-5 overflow-y-auto space-y-5 flex flex-col justify-between shrink-0">
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold leading-tight">{title}</h2>
          <p className="text-[10px] text-zinc-500">Instructor: {instructorEmail}</p>
        </div>
        <div className="border-t border-zinc-800 pt-3 prose prose-invert max-w-none text-xs text-zinc-350 leading-relaxed whitespace-pre-wrap">
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
