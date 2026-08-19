"use client";

import { useState } from "react";
import { BarChart2, Loader2 } from "lucide-react";
import {
  getAssignmentStats,
  type AssignmentStats,
} from "@/app/actions/assignment-stats";
import { NarrativeReport } from "./stats-dashboard/narrative-report";

interface StatsDashboardProps {
  assignmentId: string;
  similarityMatchCount: number | null;
}

export function StatsDashboard({
  assignmentId,
  similarityMatchCount,
}: StatsDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getAssignmentStats(assignmentId);
    if (result.success) {
      setStats(result.stats!);
    } else {
      setError(result.error || "Failed to compute stats");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-[24px] border border-surface-container shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <BarChart2 className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-sm text-on-surface">
              Class Stats Dashboard
            </h3>
            <p className="text-[10px] text-secondary mt-0.5">
              Deterministic performance and integrity breakdown
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isLoading ? "Computing..." : "Generate Stats"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-destructive font-semibold">{error}</p>
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatTile label="Average Score" value={`${stats.averageScore}%`} />
          <StatTile label="Median Score" value={`${stats.medianScore}%`} />
          <StatTile
            label="Score Distribution"
            value={`${stats.scoreDistribution.low} / ${stats.scoreDistribution.mid} / ${stats.scoreDistribution.high}`}
            hint="0-40 / 40-70 / 70-100"
          />
          <StatTile
            label="Most Failed Test Case"
            value={
              stats.mostFailedTestCase
                ? `${stats.mostFailedTestCase.failCount} fails`
                : "None"
            }
          />
          <StatTile
            label="Submitted in Last Hour"
            value={`${stats.submittedInLastHourCount} / ${stats.totalSubmissions}`}
          />
          <StatTile
            label="Similarity Matches"
            value={
              similarityMatchCount === null
                ? "Not yet checked"
                : `${similarityMatchCount}`
            }
          />
          {stats.hintUsageCorrelation.map((entry) => (
            <StatTile
              key={entry.bucket}
              label={`Avg Score (${entry.bucket} hints)`}
              value={`${entry.averageScore}%`}
            />
          ))}
          {Object.entries(stats.riskFlagCounts).map(([flag, count]) => (
            <StatTile
              key={flag}
              label={`${flag} Risk Submissions`}
              value={`${count}`}
            />
          ))}
        </div>
      )}

      <NarrativeReport assignmentId={assignmentId} hasStats={!!stats} />
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
      <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">
        {label}
      </p>
      <span className="text-xl font-extrabold text-on-surface">{value}</span>
      {hint && <p className="text-[9px] text-secondary mt-1">{hint}</p>}
    </div>
  );
}
