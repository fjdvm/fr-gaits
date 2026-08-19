import { Target, TrendingUp } from "lucide-react";
import type { SubmissionAnalysis } from "@/app/actions/submission-analysis";

interface AccuracyStatsProps {
  accuracy: SubmissionAnalysis["accuracy"];
  classComparison: SubmissionAnalysis["classComparison"];
}

export function AccuracyStats({ accuracy, classComparison }: AccuracyStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StatTile
        icon={<Target className="h-4 w-4 text-primary" />}
        label="Accuracy"
        value={`${accuracy.score}%`}
        hint={`${accuracy.passedCount} of ${accuracy.totalCount} test cases passed`}
      />
      <StatTile
        icon={<TrendingUp className="h-4 w-4 text-primary" />}
        label="Class Percentile"
        value={`${classComparison.percentileRank}th`}
        hint={`Class average: ${classComparison.classAverageScore}% (${classComparison.totalSubmissions} submissions)`}
      />
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">{label}</p>
      </div>
      <span className="text-2xl font-extrabold text-on-surface">{value}</span>
      {hint && <p className="text-[10px] text-secondary mt-1">{hint}</p>}
    </div>
  );
}
