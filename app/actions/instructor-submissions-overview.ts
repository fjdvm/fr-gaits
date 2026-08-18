"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getInstructorSubmissionsOverview() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const assignments = await prisma.assignment.findMany({
      where: { createdBy: user.id },
      include: {
        classes: { include: { class: { select: { id: true, name: true, archived: true } } } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedAssignments = assignments
      .map((a) => ({
        id: a.id,
        title: a.title,
        language: a.language,
        dueDate: a.dueDate.toISOString(),
        classes: a.classes.filter((c) => !c.class.archived).map((c) => ({ id: c.class.id, name: c.class.name })),
        submissionCount: a._count.submissions,
      }))
      .filter((a) => a.classes.length > 0);

    const classes = await prisma.class.findMany({
      where: { instructorId: user.id, archived: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return { success: true, assignments: formattedAssignments, classes };
  } catch (err) {
    console.error("Failed to fetch instructor submissions overview:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
