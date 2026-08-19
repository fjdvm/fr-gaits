import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("deleteAssignment", () => {
  let instructorId: string;
  let studentId: string;
  let classId: string;
  let assignmentId: string;
  let testCaseId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor", approvalStatus: "approved" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
      ],
    });

    const cls = await prisma.class.create({
      data: { name: "Delete Assignment Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;

    const assignment = await prisma.assignment.create({
      data: {
        title: "Assignment To Delete",
        instructions: "Do the thing",
        language: "Python",
        dueDate: new Date(Date.now() + 86400000),
        createdBy: instructorId,
        classes: { create: [{ classId }] },
        testCases: { create: [{ input: "1", expectedOutput: "1", visible: true }] },
      },
      include: { testCases: true },
    });
    assignmentId = assignment.id;
    testCaseId = assignment.testCases[0].id;

    await prisma.post.create({
      data: {
        classId,
        authorId: instructorId,
        type: "assignment_created",
        body: `New assignment posted: ${assignment.title}`,
        assignmentId,
      },
    });

    await prisma.submission.create({
      data: {
        studentId,
        assignmentId,
        code: "print(1)",
        score: 100,
        testResults: [{ testCaseId, passed: true }],
        behavioralSignals: { pasteCount: 0, pasteLength: 0, keystrokeCount: 0, wpm: 0, totalFocusTimeSecs: 0, events: [] },
      },
    });

    await prisma.heartsState.create({
      data: { studentId, assignmentId, currentCount: 5, totalSpent: 0 },
    });

    await prisma.chatMessage.create({
      data: { studentId, assignmentId, role: "user", content: "help" },
    });
  });

  afterEach(async () => {
    await prisma.chatMessage.deleteMany({ where: { assignmentId } });
    await prisma.heartsState.deleteMany({ where: { assignmentId } });
    await prisma.submission.deleteMany({ where: { assignmentId } });
    await prisma.post.deleteMany({ where: { assignmentId } });
    await prisma.testCase.deleteMany({ where: { assignmentId } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId } });
    await prisma.assignment.deleteMany({ where: { id: assignmentId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("deletes the assignment and all dependent records for the owning instructor", async () => {
    mockAuthenticatedUser(instructorId);
    const { deleteAssignment } = await import("@/app/actions/delete-assignment");

    const result = await deleteAssignment(assignmentId);

    expect(result.success).toBe(true);

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    expect(assignment).toBeNull();

    const testCases = await prisma.testCase.findMany({ where: { assignmentId } });
    expect(testCases).toHaveLength(0);

    const submissions = await prisma.submission.findMany({ where: { assignmentId } });
    expect(submissions).toHaveLength(0);

    const heartsStates = await prisma.heartsState.findMany({ where: { assignmentId } });
    expect(heartsStates).toHaveLength(0);

    const chatMessages = await prisma.chatMessage.findMany({ where: { assignmentId } });
    expect(chatMessages).toHaveLength(0);

    const posts = await prisma.post.findMany({ where: { assignmentId } });
    expect(posts).toHaveLength(0);
  });

  it("rejects a caller who does not own the assignment", async () => {
    const otherInstructorId = randomUUID();
    await prisma.user.create({
      data: { id: otherInstructorId, email: `other-${otherInstructorId}@test.com`, role: "instructor", approvalStatus: "approved" },
    });
    mockAuthenticatedUser(otherInstructorId);
    const { deleteAssignment } = await import("@/app/actions/delete-assignment");

    const result = await deleteAssignment(assignmentId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    expect(assignment).not.toBeNull();

    await prisma.user.deleteMany({ where: { id: otherInstructorId } });
  });

  it("rejects an unauthenticated caller", async () => {
    const { mockUnauthenticated } = await import("../../test/mock-auth");
    mockUnauthenticated();
    const { deleteAssignment } = await import("@/app/actions/delete-assignment");

    const result = await deleteAssignment(assignmentId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("errors when the assignment does not exist", async () => {
    mockAuthenticatedUser(instructorId);
    const { deleteAssignment } = await import("@/app/actions/delete-assignment");

    const result = await deleteAssignment(randomUUID());

    expect(result.success).toBe(false);
    expect(result.error).toBe("Assignment not found");
  });
});
