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

  // Fetch student's enrolled classes and their assignments with student's interaction states
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
          assignments: {
            include: {
              assignment: {
                include: {
                  heartsStates: {
                    where: { studentId: user.id },
                  },
                  submissions: {
                    where: { studentId: user.id },
                  },
                },
              },
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
    assignments: e.class.assignments.map((ac) => {
      const hasSubmission = ac.assignment.submissions.length > 0;
      const hasStarted = ac.assignment.heartsStates.length > 0;
      
      let status = "not started";
      if (hasSubmission) {
        status = "submitted";
      } else if (hasStarted) {
        status = "in progress";
      }

      return {
        id: ac.assignment.id,
        title: ac.assignment.title,
        language: ac.assignment.language,
        dueDate: ac.assignment.dueDate.toISOString(),
        status,
      };
    }),
  }));

  return <StudentView initialClasses={enrolledClasses} />;
}
