"use server";

import { generateText } from "ai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getModelWithFallback } from "@/lib/ai-provider";
import { buildSubmissionAnalysisPrompt } from "@/lib/submission-analysis-prompt";
import { getDisplayName } from "@/lib/display-name";
import { getSubmissionAnalysis } from "./submission-analysis";

export async function generateSubmissionReport(assignmentId: string, studentId: string) {
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

    const analysisResult = await getSubmissionAnalysis(assignmentId, studentId);
    if (!analysisResult.success) throw new Error(analysisResult.error);

    const student = await prisma.user.findUnique({ where: { id: studentId }, select: { email: true, name: true } });
    const studentDisplayName = getDisplayName({ name: student?.name ?? null, email: student?.email ?? "Unknown" });

    const prompt = buildSubmissionAnalysisPrompt(analysisResult.analysis!, studentDisplayName);
    const model = await getModelWithFallback(assignmentId);
    const { text } = await generateText({ model, prompt });

    return { success: true, narrative: text };
  } catch (err) {
    console.error("Failed to generate submission report:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
