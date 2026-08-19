"use server";

import { generateText } from "ai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getModelWithFallback } from "@/lib/ai-provider";
import { buildStatsPrompt } from "@/lib/stats-prompt";
import { getAssignmentStats } from "./assignment-stats";

interface GenerateReportOptions {
  forceRegenerate?: boolean;
}

export async function generateAssignmentReport(assignmentId: string, options: GenerateReportOptions = {}) {
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

    if (!options.forceRegenerate && assignment.statsReportNarrative) {
      return { success: true, narrative: assignment.statsReportNarrative };
    }

    const statsResult = await getAssignmentStats(assignmentId);
    if (!statsResult.success) throw new Error(statsResult.error);

    const prompt = buildStatsPrompt(statsResult.stats!);
    const model = await getModelWithFallback(assignmentId);
    const { text } = await generateText({ model, prompt });

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: { statsReportNarrative: text, statsReportGeneratedAt: new Date() },
    });

    return { success: true, narrative: text };
  } catch (err) {
    console.error("Failed to generate assignment report:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
