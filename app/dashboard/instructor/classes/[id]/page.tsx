import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getClassStream } from "@/app/actions/class-stream";
import { getClassRoster } from "@/app/actions/class-roster";
import { InstructorClassView } from "@/components/features/classes/instructor-class-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InstructorClassDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls || cls.instructorId !== user.id) {
    redirect("/dashboard/instructor");
  }

  const [streamResult, rosterResult, assignmentLinks] = await Promise.all([
    getClassStream(id),
    getClassRoster(id),
    prisma.assignmentClass.findMany({
      where: { classId: id },
      include: {
        assignment: {
          include: { _count: { select: { classes: true, testCases: true } } },
        },
      },
      orderBy: { assignment: { createdAt: "desc" } },
    }),
  ]);

  const assignments = assignmentLinks.map((link) => ({
    id: link.assignment.id,
    title: link.assignment.title,
    language: link.assignment.language,
    dueDate: link.assignment.dueDate.toISOString(),
    testCaseCount: link.assignment._count.testCases,
    isSharedWithOtherClasses: link.assignment._count.classes > 1,
  }));

  return (
    <InstructorClassView
      classId={id}
      className={cls.name}
      joinCode={cls.joinCode}
      initialPosts={streamResult.success ? streamResult.posts! : []}
      currentUserId={user.id}
      assignments={assignments}
      roster={rosterResult.success ? rosterResult.students! : []}
    />
  );
}
