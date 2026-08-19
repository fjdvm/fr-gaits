import { BarChart3, CheckCircle2, AlertCircle } from "lucide-react";

interface SubmissionsSummaryProps {
  averageScore: number;
  submissionCount: number;
  totalStudents: number;
  missingCount: number;
}

export function SubmissionsSummary({ averageScore, submissionCount, totalStudents, missingCount }: SubmissionsSummaryProps) {
  return (
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
  );
}
