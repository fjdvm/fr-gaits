"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getStudentTodos() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id, archived: false, class: { archived: false } },
      include: {
        class: {
          include: {
            assignments: {
              include: {
                assignment: {
                  include: {
                    submissions: { where: { studentId: user.id } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const todos = enrollments
      .flatMap((e) =>
        e.class.assignments
          .filter((ac) => ac.assignment.submissions.length === 0)
          .map((ac) => ({
            id: ac.assignment.id,
            title: ac.assignment.title,
            language: ac.assignment.language,
            dueDate: ac.assignment.dueDate.toISOString(),
            classId: e.class.id,
            className: e.class.name,
          }))
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const classes = enrollments.map((e) => ({ id: e.class.id, name: e.class.name }));

    return { success: true, todos, classes };
  } catch (err) {
    console.error("Failed to fetch student todos:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
