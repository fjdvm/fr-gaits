import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getInstructorAssignments } from "@/app/actions/instructor-assignments";
import { InstructorView } from "@/components/features/dashboard/instructor-view";

export default async function InstructorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
    archived: cls.archived,
  }));

  const assignmentsResult = await getInstructorAssignments();

  return (
    <InstructorView
      initialClasses={formattedClasses}
      initialAssignments={assignmentsResult.success ? assignmentsResult.assignments! : []}
    />
  );
}
