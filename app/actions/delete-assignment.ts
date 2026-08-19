"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function deleteAssignment(assignmentId: string) {
  try {
    if (!assignmentId) throw new Error("Assignment ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.createdBy !== user.id) {
      throw new Error("Unauthorized: Only the assignment's creator can delete it");
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.deleteMany({ where: { assignmentId, type: "assignment_created" } });
      await tx.assignment.delete({ where: { id: assignmentId } });
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to delete assignment:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
