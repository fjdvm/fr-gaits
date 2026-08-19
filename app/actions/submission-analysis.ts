"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { tokenize, type SupportedLanguage } from "@/lib/similarity/tokenizer";
import { computeSimilarity } from "@/lib/similarity/winnowing";
import { getDisplayName } from "@/lib/display-name";
import type { StoredBehavioralSignals } from "@/lib/types/behavioral-signals";

const SIMILARITY_THRESHOLD = 0.4;

interface TestResult {
  testCaseId: string;
  passed: boolean;
}

export interface SimilarSubmission {
  studentId: string;
  displayName: string;
  similarity: number;
}

export interface SubmissionAnalysis {
  accuracy: {
    score: number;
    passedCount: number;
    totalCount: number;
  };
  classComparison: {
    classAverageScore: number;
    percentileRank: number;
    totalSubmissions: number;
  };
  behavioralSummary: {
    riskFlag: "Low" | "Medium" | "High" | null;
    riskTotal: number | null;
    pasteCount: number;
    keystrokeCount: number;
    wpm: number;
    totalFocusTimeSecs: number;
  };
  similarSubmissions: SimilarSubmission[];
}

export async function getSubmissionAnalysis(assignmentId: string, studentId: string) {
  try {
    if (!assignmentId || !studentId) throw new Error("Assignment ID and Student ID are required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.createdBy !== user.id) {
      throw new Error("Unauthorized: You do not own this assignment");
    }

    const targetSubmission = await prisma.submission.findUnique({
      where: { studentId_assignmentId: { studentId, assignmentId } },
    });
    if (!targetSubmission) throw new Error("Submission not found");

    const allSubmissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: { student: { select: { email: true, name: true } } },
    });

    const accuracy = computeAccuracy(targetSubmission.testResults as unknown as TestResult[]);
    const classComparison = computeClassComparison(targetSubmission.score, allSubmissions);
    const behavioralSummary = computeBehavioralSummary(targetSubmission.behavioralSignals as unknown as StoredBehavioralSignals);
    const similarSubmissions = await computeSimilarSubmissions(
      studentId,
      targetSubmission.code,
      assignment.language as SupportedLanguage,
      allSubmissions
    );

    const analysis: SubmissionAnalysis = {
      accuracy,
      classComparison,
      behavioralSummary,
      similarSubmissions,
    };

    return { success: true, analysis };
  } catch (err) {
    console.error("Failed to compute submission analysis:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function computeAccuracy(testResults: TestResult[]): SubmissionAnalysis["accuracy"] {
  const results = testResults || [];
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  return { score, passedCount, totalCount };
}

function computeClassComparison(
  targetScore: number,
  allSubmissions: { score: number }[]
): SubmissionAnalysis["classComparison"] {
  const totalSubmissions = allSubmissions.length;
  const classAverageScore =
    totalSubmissions > 0
      ? Math.round(allSubmissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions)
      : 0;
  const scoresBelowOrEqual = allSubmissions.filter((s) => s.score <= targetScore).length;
  const percentileRank = totalSubmissions > 0 ? Math.round((scoresBelowOrEqual / totalSubmissions) * 100) : 0;
  return { classAverageScore, percentileRank, totalSubmissions };
}

function computeBehavioralSummary(signals: StoredBehavioralSignals): SubmissionAnalysis["behavioralSummary"] {
  return {
    riskFlag: signals?.riskScore?.flag ?? null,
    riskTotal: signals?.riskScore?.total ?? null,
    pasteCount: signals?.pasteCount ?? 0,
    keystrokeCount: signals?.keystrokeCount ?? 0,
    wpm: signals?.wpm ?? 0,
    totalFocusTimeSecs: signals?.totalFocusTimeSecs ?? 0,
  };
}

async function computeSimilarSubmissions(
  targetStudentId: string,
  targetCode: string,
  language: SupportedLanguage,
  allSubmissions: { studentId: string; code: string; student: { email: string; name: string | null } }[]
): Promise<SimilarSubmission[]> {
  const targetTokens = await tokenize(targetCode, language);

  const others = allSubmissions.filter((s) => s.studentId !== targetStudentId);
  const compared = await Promise.all(
    others.map(async (s) => {
      const tokens = await tokenize(s.code, language);
      const similarity = computeSimilarity(targetTokens, tokens);
      return {
        studentId: s.studentId,
        displayName: getDisplayName({ name: s.student.name, email: s.student.email }),
        similarity,
      };
    })
  );

  return compared
    .filter((c) => c.similarity >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.similarity - a.similarity);
}
