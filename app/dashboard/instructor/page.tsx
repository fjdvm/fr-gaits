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

  // Fetch classes created by this instructor along with enrollment counts
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

  return <InstructorView initialClasses={formattedClasses} />;
}
