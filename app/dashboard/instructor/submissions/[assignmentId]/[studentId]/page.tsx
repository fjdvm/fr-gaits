import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SubmissionDetailView } from "@/components/features/submissions/submission-detail-view";

interface PageProps {
  params: Promise<{ assignmentId: string; studentId: string }>;
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { assignmentId, studentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.createdBy !== user.id) redirect("/dashboard/instructor/submissions");

  const submission = await prisma.submission.findUnique({
    where: { studentId_assignmentId: { studentId, assignmentId } },
    include: { student: { select: { email: true } } },
  });

  const chatMessages = await prisma.chatMessage.findMany({
    where: { studentId, assignmentId },
    orderBy: { createdAt: "asc" },
  });

  const student = await prisma.user.findUnique({ where: { id: studentId }, select: { email: true } });

  return (
    <SubmissionDetailView
      assignmentTitle={assignment.title}
      assignmentLanguage={assignment.language}
      studentEmail={student?.email || "Unknown"}
      submission={submission ? {
        code: submission.code,
        score: submission.score,
        testResults: submission.testResults as any,
        behavioralSignals: submission.behavioralSignals as any,
        submittedAt: submission.submittedAt.toISOString(),
      } : null}
      chatMessages={chatMessages.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt.toISOString() }))}
    />
  );
}
