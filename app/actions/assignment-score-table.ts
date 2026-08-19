"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getAssignmentScoreTable(assignmentId: string) {
  try {
    if (!assignmentId) throw new Error("Assignment ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classes: {
          include: {
            class: {
              include: { enrollments: { include: { student: { select: { id: true, email: true, name: true } } } } },
            },
          },
        },
      },
    });

    if (!assignment) throw new Error("Assignment not found");
    if (assignment.createdBy !== user.id) throw new Error("Unauthorized: You do not own this assignment");

    const activeClassLinks = assignment.classes.filter((c) => !c.class.archived);

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: { student: { select: { id: true, email: true, name: true } } },
    });

    const allStudents = activeClassLinks.flatMap((c) => c.class.enrollments.map((e) => e.student));
    const uniqueStudents = Array.from(new Map(allStudents.map((s) => [s.id, s])).values());

    const studentRows = uniqueStudents.map((student) => {
      const sub = submissions.find((s) => s.studentId === student.id);
      return {
        studentId: student.id,
        email: student.email,
        name: student.name,
        score: sub?.score ?? null,
        submittedAt: sub?.submittedAt?.toISOString() ?? null,
        hasSubmission: !!sub,
      };
    });

    studentRows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    return { success: true, assignmentTitle: assignment.title, students: studentRows };
  } catch (err) {
    console.error("Failed to fetch assignment score table:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
