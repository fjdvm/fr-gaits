"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { getSubmissionAnalysis, type SubmissionAnalysis } from "@/app/actions/submission-analysis";
import { AccuracyStats } from "./analysis-tab/accuracy-stats";
import { SimilarSubmissionsCard } from "./analysis-tab/similar-submissions-card";
import { OverallReportCard } from "./analysis-tab/overall-report-card";
import { RiskFlagCard } from "./behavior-tab/risk-flag-card";
import { EventTimeline } from "./behavior-tab/event-timeline";
import { BehaviorStatsGrid } from "./analysis-tab/behavior-stats-grid";
import type { StoredBehavioralSignals } from "@/lib/types/behavioral-signals";

interface AnalysisTabProps {
  assignmentId: string;
  studentId: string;
  behavioralSignals: StoredBehavioralSignals;
}

export function AnalysisTab({ assignmentId, studentId, behavioralSignals }: AnalysisTabProps) {
  const [analysis, setAnalysis] = useState<SubmissionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getSubmissionAnalysis(assignmentId, studentId).then((result) => {
      if (!isMounted) return;
      if (result.success) {
        setAnalysis(result.analysis!);
      } else {
        setError(result.error || "Failed to load analysis");
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [assignmentId, studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-10 w-10 text-secondary/30 mx-auto mb-2" />
        <p className="text-xs text-secondary font-semibold">{error || "No analysis available."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccuracyStats accuracy={analysis.accuracy} classComparison={analysis.classComparison} />

      {behavioralSignals?.riskScore && <RiskFlagCard riskScore={behavioralSignals.riskScore} />}

      <BehaviorStatsGrid behavioralSignals={behavioralSignals} />

      <EventTimeline events={behavioralSignals?.events} />

      <SimilarSubmissionsCard assignmentId={assignmentId} similarSubmissions={analysis.similarSubmissions} />

      <OverallReportCard assignmentId={assignmentId} studentId={studentId} />
    </div>
  );
}
