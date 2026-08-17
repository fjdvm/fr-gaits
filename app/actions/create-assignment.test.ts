import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("createAssignment auto-post", () => {
  let instructorId: string;
  let classId: string;
  let createdAssignmentId: string | undefined;

  beforeEach(async () => {
    instructorId = randomUUID();
    await prisma.user.create({
      data: {
        id: instructorId,
        email: `instructor-${instructorId}@test.com`,
        role: "instructor",
        approvalStatus: "approved",
      },
    });
    const cls = await prisma.class.create({
      data: { name: "Auto Post Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
  });

  afterEach(async () => {
    if (createdAssignmentId) {
      await prisma.testCase.deleteMany({ where: { assignmentId: createdAssignmentId } });
      await prisma.assignmentClass.deleteMany({ where: { assignmentId: createdAssignmentId } });
      await prisma.post.deleteMany({ where: { assignmentId: createdAssignmentId } });
      await prisma.assignment.deleteMany({ where: { id: createdAssignmentId } });
    }
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: instructorId } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
    createdAssignmentId = undefined;
  });

  it("automatically posts an assignment_created entry to the target class's stream", async () => {
    mockAuthenticatedUser(instructorId);
    const { createAssignment } = await import("@/app/actions/create-assignment");

    const result = await createAssignment({
      title: "New Assignment",
      instructions: "Do the thing",
      language: "Python",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      heartsCount: 5,
      heartsRegenMinutes: 30,
      classIds: [classId],
      testCases: [{ input: "1", expectedOutput: "1", visible: true }],
    });

    expect(result.success).toBe(true);
    createdAssignmentId = result.assignment!.id;

    const posts = await prisma.post.findMany({ where: { classId, type: "assignment_created" } });
    expect(posts).toHaveLength(1);
    expect(posts[0].assignmentId).toBe(createdAssignmentId);
  });
});
