"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface TestCaseInput {
  input: string;
  expectedOutput: string;
  visible: boolean;
}

interface CreateAssignmentParams {
  title: string;
  instructions: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  heartsRegenMinutes: number;
  classIds: string[];
  testCases: TestCaseInput[];
}

export async function createAssignment(params: CreateAssignmentParams) {
  try {
    const {
      title,
      instructions,
      language,
      dueDate,
      heartsCount,
      heartsRegenMinutes,
      classIds,
      testCases,
    } = params;

    if (!title || title.trim() === "") {
      throw new Error("Title cannot be empty");
    }
    if (!instructions || instructions.trim() === "") {
      throw new Error("Instructions cannot be empty");
    }
    if (!language) {
      throw new Error("Language must be specified");
    }
    if (!dueDate) {
      throw new Error("Due date must be specified");
    }
    if (!classIds || classIds.length === 0) {
      throw new Error("At least one class must be selected");
    }
    if (!testCases || testCases.length === 0) {
      throw new Error("At least one test case is required");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || dbUser.role !== "instructor" || dbUser.approvalStatus !== "approved") {
      throw new Error("Unauthorized: Only approved instructors can create assignments");
    }

    const newAssignment = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          title: title.trim(),
          instructions: instructions.trim(),
          language,
          dueDate: new Date(dueDate),
          heartsCount,
          heartsRegenMinutes,
          createdBy: user.id,
        },
      });

      await tx.assignmentClass.createMany({
        data: classIds.map((classId) => ({
          assignmentId: assignment.id,
          classId,
        })),
      });

      await tx.testCase.createMany({
        data: testCases.map((tc) => ({
          assignmentId: assignment.id,
          input: tc.input.trim(),
          expectedOutput: tc.expectedOutput.trim(),
          visible: tc.visible,
        })),
      });

      await tx.post.createMany({
        data: classIds.map((classId) => ({
          classId,
          authorId: user.id,
          type: "assignment_created",
          body: `New assignment posted: ${assignment.title}`,
          assignmentId: assignment.id,
        })),
      });

      return assignment;
    });

    return { success: true, assignment: newAssignment };
  } catch (err) {
    console.error("Failed to create assignment:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
