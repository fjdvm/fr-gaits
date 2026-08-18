"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function setEnrollmentArchived(classId: string, archived: boolean) {
  try {
    if (!classId) throw new Error("Class ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId: user.id, classId } },
    });
    if (!enrollment) throw new Error("Unauthorized: You are not enrolled in this class");

    const updated = await prisma.enrollment.update({
      where: { studentId_classId: { studentId: user.id, classId } },
      data: { archived },
    });

    return { success: true, enrollment: updated };
  } catch (err) {
    console.error(`Failed to ${archived ? "archive" : "unarchive"} enrollment:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function archiveEnrollment(classId: string) {
  return setEnrollmentArchived(classId, true);
}

export async function unarchiveEnrollment(classId: string) {
  return setEnrollmentArchived(classId, false);
}
