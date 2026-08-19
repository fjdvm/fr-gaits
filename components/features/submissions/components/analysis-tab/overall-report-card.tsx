"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { generateSubmissionReport } from "@/app/actions/submission-report";

interface OverallReportCardProps {
  assignmentId: string;
  studentId: string;
}

export function OverallReportCard({ assignmentId, studentId }: OverallReportCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    const result = await generateSubmissionReport(assignmentId, studentId);
    if (result.success) {
      setNarrative(result.narrative || null);
    } else {
      setError(result.error || "Failed to generate report");
    }
    setIsGenerating(false);
  };

  return (
    <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-primary" />
          <h5 className="font-bold text-xs text-on-surface">Overall Report</h5>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-bold text-[10px] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : narrative ? (
            <RefreshCw className="h-3 w-3" />
          ) : null}
          {isGenerating ? "Generating..." : narrative ? "Regenerate" : "Generate Report"}
        </button>
      </div>

      {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

      {narrative && (
        <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{narrative}</p>
      )}

      {!narrative && !error && (
        <p className="text-xs text-secondary">Generate an AI summary of this student&apos;s accuracy, behavior, and similarity signals.</p>
      )}
    </div>
  );
}
