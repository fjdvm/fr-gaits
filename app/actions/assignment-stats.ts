"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { StoredBehavioralSignals } from "@/lib/types/behavioral-signals";

interface TestResult {
  testCaseId: string;
  passed: boolean;
}

const HINT_BUCKETS = [
  { bucket: "0", predicate: (n: number) => n === 0 },
  { bucket: "1-3", predicate: (n: number) => n >= 1 && n <= 3 },
  { bucket: "4+", predicate: (n: number) => n >= 4 },
];

export interface AssignmentStats {
  totalSubmissions: number;
  averageScore: number;
  medianScore: number;
  scoreDistribution: { low: number; mid: number; high: number };
  mostFailedTestCase: { testCaseId: string; failCount: number } | null;
  hintUsageCorrelation: { bucket: string; averageScore: number }[];
  riskFlagCounts: Record<string, number>;
  submittedInLastHourCount: number;
}

export async function getAssignmentStats(assignmentId: string) {
  try {
    if (!assignmentId) throw new Error("Assignment ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.createdBy !== user.id) {
      throw new Error("Unauthorized: You do not own this assignment");
    }

    const submissions = await prisma.submission.findMany({ where: { assignmentId } });
    const heartsStates = await prisma.heartsState.findMany({ where: { assignmentId } });
    const hintsByStudent = new Map(heartsStates.map((h) => [h.studentId, h.totalSpent]));

    const scores = submissions.map((s) => s.score);
    const totalSubmissions = submissions.length;

    const averageScore = computeAverage(scores);
    const medianScore = computeMedian(scores);
    const scoreDistribution = computeScoreDistribution(scores);
    const mostFailedTestCase = computeMostFailedTestCase(submissions);
    const hintUsageCorrelation = computeHintUsageCorrelation(submissions, hintsByStudent);
    const riskFlagCounts = computeRiskFlagCounts(submissions);
    const submittedInLastHourCount = computeSubmittedInLastHour(submissions, assignment.dueDate);

    const stats: AssignmentStats = {
      totalSubmissions,
      averageScore,
      medianScore,
      scoreDistribution,
      mostFailedTestCase,
      hintUsageCorrelation,
      riskFlagCounts,
      submittedInLastHourCount,
    };

    return { success: true, stats };
  } catch (err) {
    console.error("Failed to compute assignment stats:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function computeAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

function computeMedian(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sorted = [...scores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

function computeScoreDistribution(scores: number[]): { low: number; mid: number; high: number } {
  return scores.reduce(
    (dist, score) => {
      if (score < 40) dist.low++;
      else if (score < 70) dist.mid++;
      else dist.high++;
      return dist;
    },
    { low: 0, mid: 0, high: 0 }
  );
}

function computeMostFailedTestCase(
  submissions: { testResults: unknown }[]
): { testCaseId: string; failCount: number } | null {
  const failCounts = new Map<string, number>();
  for (const submission of submissions) {
    const results = (submission.testResults as TestResult[]) || [];
    for (const result of results) {
      if (!result.passed) {
        failCounts.set(result.testCaseId, (failCounts.get(result.testCaseId) || 0) + 1);
      }
    }
  }

  let mostFailed: { testCaseId: string; failCount: number } | null = null;
  for (const [testCaseId, failCount] of failCounts) {
    if (!mostFailed || failCount > mostFailed.failCount) {
      mostFailed = { testCaseId, failCount };
    }
  }
  return mostFailed;
}

function computeHintUsageCorrelation(
  submissions: { studentId: string; score: number }[],
  hintsByStudent: Map<string, number>
): { bucket: string; averageScore: number }[] {
  return HINT_BUCKETS.map(({ bucket, predicate }) => {
    const matching = submissions.filter((s) => predicate(hintsByStudent.get(s.studentId) || 0));
    return { bucket, averageScore: computeAverage(matching.map((s) => s.score)) };
  });
}

function computeRiskFlagCounts(submissions: { behavioralSignals: unknown }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const submission of submissions) {
    const signals = submission.behavioralSignals as StoredBehavioralSignals;
    const flag = signals?.riskScore?.flag;
    if (flag) counts[flag] = (counts[flag] || 0) + 1;
  }
  return counts;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

function computeSubmittedInLastHour(submissions: { submittedAt: Date }[], dueDate: Date): number {
  return submissions.filter((s) => dueDate.getTime() - s.submittedAt.getTime() <= ONE_HOUR_MS).length;
}
