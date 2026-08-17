"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getClassRoster(classId: string) {
  try {
    if (!classId) throw new Error("Class ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    const isInstructor = cls.instructorId === user.id;
    if (!isInstructor) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_classId: { studentId: user.id, classId } },
      });
      if (!enrollment) {
        throw new Error("Unauthorized: You are not a member of this class");
      }
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { classId },
      include: { student: { select: { id: true, email: true } } },
      orderBy: { enrolledAt: "asc" },
    });

    return {
      success: true,
      students: enrollments.map((e) => ({ id: e.student.id, email: e.student.email })),
    };
  } catch (err) {
    console.error("Failed to fetch class roster:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
