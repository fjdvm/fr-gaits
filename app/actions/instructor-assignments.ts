"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getInstructorAssignments() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const assignments = await prisma.assignment.findMany({
      where: { createdBy: user.id },
      include: {
        classes: { include: { class: { select: { name: true, archived: true } } } },
        _count: { select: { testCases: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedAssignments = assignments
      .map((asm) => ({
        id: asm.id,
        title: asm.title,
        language: asm.language,
        dueDate: asm.dueDate.toISOString(),
        heartsCount: asm.heartsCount,
        heartsRegenMinutes: asm.heartsRegenMinutes,
        classNames: asm.classes.filter((c) => !c.class.archived).map((c) => c.class.name),
        testCaseCount: asm._count.testCases,
      }))
      .filter((asm) => asm.classNames.length > 0);

    return { success: true, assignments: formattedAssignments };
  } catch (err) {
    console.error("Failed to fetch instructor assignments:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
