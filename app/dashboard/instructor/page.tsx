import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { InstructorView } from "@/components/features/dashboard/instructor-view";

export default async function InstructorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch classes created by this instructor along with enrollment counts
  const instructorClasses = await prisma.class.findMany({
    where: { instructorId: user.id },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedClasses = instructorClasses.map((cls) => ({
    id: cls.id,
    name: cls.name,
    joinCode: cls.joinCode,
    studentCount: cls._count.enrollments,
    createdAt: cls.createdAt.toISOString(),
  }));

  // 2. Fetch assignments created by this instructor
  const instructorAssignments = await prisma.assignment.findMany({
    where: { createdBy: user.id },
    include: {
      classes: {
        include: {
          class: {
            select: {
              name: true,
            },
          },
        },
      },
      _count: {
        select: {
          testCases: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedAssignments = instructorAssignments.map((asm) => ({
    id: asm.id,
    title: asm.title,
    language: asm.language,
    dueDate: asm.dueDate.toISOString(),
    heartsCount: asm.heartsCount,
    heartsRegenMinutes: asm.heartsRegenMinutes,
    classNames: asm.classes.map((c) => c.class.name),
    testCaseCount: asm._count.testCases,
  }));

  return (
    <InstructorView
      initialClasses={formattedClasses}
      initialAssignments={formattedAssignments}
    />
  );
}
