import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getClassStream } from "@/app/actions/class-stream";
import { getClassRoster } from "@/app/actions/class-roster";
import { StudentClassView } from "@/components/features/classes/student-class-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentClassDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_classId: { studentId: user.id, classId: id } },
  });
  if (!enrollment) {
    redirect("/dashboard/student");
  }

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls) redirect("/dashboard/student");

  const [streamResult, rosterResult, assignmentLinks] = await Promise.all([
    getClassStream(id),
    getClassRoster(id),
    prisma.assignmentClass.findMany({
      where: { classId: id },
      include: { assignment: true },
      orderBy: { assignment: { dueDate: "asc" } },
    }),
  ]);

  const assignments = assignmentLinks.map((link) => ({
    id: link.assignment.id,
    title: link.assignment.title,
    language: link.assignment.language,
    dueDate: link.assignment.dueDate.toISOString(),
  }));

  return (
    <StudentClassView
      classId={id}
      className={cls!.name}
      initialPosts={streamResult.success ? streamResult.posts! : []}
      currentUserId={user.id}
      assignments={assignments}
      roster={rosterResult.success ? rosterResult.students! : []}
    />
  );
}
