import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { StudentView } from "@/components/features/dashboard/student-view";

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch student's enrolled classes
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      class: {
        include: {
          instructor: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const enrolledClasses = enrollments.map((e) => ({
    id: e.class.id,
    name: e.class.name,
    joinCode: e.class.joinCode,
    instructorEmail: e.class.instructor.email,
    enrolledAt: e.enrolledAt.toISOString(),
  }));

  return <StudentView initialClasses={enrolledClasses} />;
}
