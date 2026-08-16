import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { AssignmentScoreTable } from "@/components/features/submissions/assignment-score-table";

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  const { assignmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { classes: { include: { class: { include: { enrollments: { include: { student: { select: { id: true, email: true } } } } } } } } },
  });

  if (!assignment || assignment.createdBy !== user.id) redirect("/dashboard/instructor/submissions");

  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: { student: { select: { id: true, email: true } } },
  });

  const allStudents = assignment.classes.flatMap((c) => c.class.enrollments.map((e) => e.student));
  const uniqueStudents = Array.from(new Map(allStudents.map((s) => [s.id, s])).values());

  const studentRows = uniqueStudents.map((student) => {
    const sub = submissions.find((s) => s.studentId === student.id);
    return {
      studentId: student.id,
      email: student.email,
      score: sub?.score ?? null,
      submittedAt: sub?.submittedAt?.toISOString() ?? null,
      hasSubmission: !!sub,
    };
  });

  studentRows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <AssignmentScoreTable
      assignmentId={assignmentId}
      assignmentTitle={assignment.title}
      students={studentRows}
    />
  );
}
