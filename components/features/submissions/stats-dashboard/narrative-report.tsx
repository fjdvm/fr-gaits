"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { generateAssignmentReport } from "@/app/actions/assignment-report";

interface NarrativeReportProps {
  assignmentId: string;
  hasStats: boolean;
}

export function NarrativeReport({ assignmentId, hasStats }: NarrativeReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (forceRegenerate: boolean) => {
    setIsGenerating(true);
    setError(null);
    const result = await generateAssignmentReport(assignmentId, { forceRegenerate });
    if (result.success) {
      setNarrative(result.narrative || null);
    } else {
      setError(result.error || "Failed to generate report");
    }
    setIsGenerating(false);
  };

  if (!hasStats) return null;

  return (
    <div className="mt-6 pt-6 border-t border-surface-container">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="font-bold text-sm text-on-surface">AI Summary</h4>
        </div>
        <button
          onClick={() => handleGenerate(!!narrative)}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : narrative ? (
            <RefreshCw className="h-3.5 w-3.5" />
          ) : null}
          {isGenerating ? "Generating..." : narrative ? "Regenerate Report" : "Generate Report"}
        </button>
      </div>

      {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

      {narrative && (
        <p className="text-sm text-on-surface bg-primary-container/10 border border-primary-container/30 rounded-2xl p-4 leading-relaxed">
          {narrative}
        </p>
      )}
    </div>
  );
}
