"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function leaveClass(classId: string) {
  try {
    if (!classId) throw new Error("Class ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId: user.id, classId } },
    });
    if (!enrollment) throw new Error("You are not enrolled in this class");

    await prisma.enrollment.delete({
      where: { studentId_classId: { studentId: user.id, classId } },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to leave class:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
