"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function saveDraft(assignmentId: string, code: string) {
  try {
    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }
    if (code === undefined || code === null) {
      throw new Error("Code content is required");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: {
        studentId_assignmentId: {
          studentId: user.id,
          assignmentId,
        },
      },
      select: { id: true },
    });

    if (existingSubmission) {
      throw new Error("Assignment already submitted. Code is read-only.");
    }

    const draft = await prisma.codeDraft.upsert({
      where: {
        studentId_assignmentId: {
          studentId: user.id,
          assignmentId,
        },
      },
      update: { code },
      create: {
        studentId: user.id,
        assignmentId,
        code,
      },
    });

    return { success: true, updatedAt: draft.updatedAt.toISOString() };
  } catch (err) {
    console.error("Failed to save draft:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
