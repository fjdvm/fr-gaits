"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function kickStudent(classId: string, studentId: string) {
  try {
    if (!classId) throw new Error("Class ID is required");
    if (!studentId) throw new Error("Student ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");
    if (cls.instructorId !== user.id) {
      throw new Error("Unauthorized: Only the class instructor can remove students");
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    if (!enrollment) throw new Error("Student is not enrolled in this class");

    await prisma.enrollment.delete({
      where: { studentId_classId: { studentId, classId } },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to kick student:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
