import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceView } from "@/components/features/assignments/workspace-view";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssignmentWorkspacePage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch assignment along with instructor details
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      instructor: {
        select: {
          email: true,
        },
      },
      testCases: {
        where: { visible: true },
      },
    },
  });

  if (!assignment) {
    redirect("/dashboard/student");
  }

  // Verify student is enrolled in at least one class that this assignment belongs to
  const assignmentClasses = await prisma.assignmentClass.findMany({
    where: { assignmentId: id },
    select: { classId: true },
  });

  const classIds = assignmentClasses.map((ac) => ac.classId);

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: user.id,
      classId: { in: classIds },
    },
  });

  if (!enrollment) {
    // Student is not enrolled in a class assigned this programming problem
    redirect("/dashboard/student");
  }

  // Initialize hearts state (thus marking assignment status as "in progress")
  let heartsState = await prisma.heartsState.findUnique({
    where: {
      studentId_assignmentId: {
        studentId: user.id,
        assignmentId: id,
      },
    },
  });

  if (!heartsState) {
    heartsState = await prisma.heartsState.create({
      data: {
        studentId: user.id,
        assignmentId: id,
        currentCount: assignment.heartsCount,
      },
    });
  }

  // Format assignment data for client workspace
  const formattedAssignment = {
    id: assignment.id,
    title: assignment.title,
    instructions: assignment.instructions,
    language: assignment.language,
    dueDate: assignment.dueDate.toISOString(),
    heartsCount: assignment.heartsCount,
    heartsRegenMinutes: assignment.heartsRegenMinutes,
    instructorEmail: assignment.instructor.email,
  };

  const formattedHearts = {
    currentCount: heartsState.currentCount,
    lastRegenAt: heartsState.lastRegenAt.toISOString(),
    totalSpent: heartsState.totalSpent,
  };

  const formattedTestCases = assignment.testCases.map((tc) => ({
    id: tc.id,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  }));

  // Fetch student's existing submission if it exists
  const submission = await prisma.submission.findUnique({
    where: {
      studentId_assignmentId: {
        studentId: user.id,
        assignmentId: id,
      },
    },
  });

  const formattedSubmission = submission
    ? {
        id: submission.id,
        code: submission.code,
        score: submission.score,
        testResults: submission.testResults as any,
        submittedAt: submission.submittedAt.toISOString(),
      }
    : null;

  return (
    <WorkspaceView
      assignment={formattedAssignment}
      initialHearts={formattedHearts}
      visibleTestCases={formattedTestCases}
      initialSubmission={formattedSubmission}
    />
  );
}
