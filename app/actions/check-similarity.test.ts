import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("checkSimilarity", () => {
  let instructorId: string;
  let studentAId: string;
  let studentBId: string;
  let studentCId: string;
  let classId: string;
  let assignmentId: string;
  let otherAssignmentId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentAId = randomUUID();
    studentBId = randomUUID();
    studentCId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentAId, email: `student-a-${studentAId}@test.com`, role: "student" },
        { id: studentBId, email: `student-b-${studentBId}@test.com`, role: "student" },
        { id: studentCId, email: `student-c-${studentCId}@test.com`, role: "student" },
      ],
    });

    const cls = await prisma.class.create({
      data: { name: "Similarity Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;

    const assignment = await prisma.assignment.create({
      data: {
        title: "Similarity Assignment",
        instructions: "Write add()",
        language: "Python",
        dueDate: new Date(Date.now() + 86400000),
        createdBy: instructorId,
        classes: { create: [{ classId }] },
      },
    });
    assignmentId = assignment.id;

    const otherAssignment = await prisma.assignment.create({
      data: {
        title: "Other Assignment",
        instructions: "Write subtract()",
        language: "Python",
        dueDate: new Date(Date.now() + 86400000),
        createdBy: instructorId,
        classes: { create: [{ classId }] },
      },
    });
    otherAssignmentId = otherAssignment.id;

    const behavioralSignals = {
      pasteCount: 0,
      pasteLength: 0,
      keystrokeCount: 100,
      wpm: 20,
      totalFocusTimeSecs: 60,
      events: [],
    };

    // Student A and B submit near-identical code (renamed variables) -> should be flagged
    await prisma.submission.create({
      data: {
        studentId: studentAId,
        assignmentId,
        code: "def add(a, b):\n    result = a + b\n    return result\n",
        score: 100,
        testResults: [],
        behavioralSignals,
      },
    });
    await prisma.submission.create({
      data: {
        studentId: studentBId,
        assignmentId,
        code: "def add(x, y):\n    total = x + y\n    return total\n",
        score: 100,
        testResults: [],
        behavioralSignals,
      },
    });
    // Student C submits genuinely different code -> should not be flagged against A or B
    await prisma.submission.create({
      data: {
        studentId: studentCId,
        assignmentId,
        code: "def is_even(n):\n    return n % 2 == 0\n",
        score: 100,
        testResults: [],
        behavioralSignals,
      },
    });
    // Student A also submits to a different assignment -> must not be included in this assignment's pool
    await prisma.submission.create({
      data: {
        studentId: studentAId,
        assignmentId: otherAssignmentId,
        code: "def add(a, b):\n    result = a + b\n    return result\n",
        score: 100,
        testResults: [],
        behavioralSignals,
      },
    });
  });

  afterEach(async () => {
    await prisma.submission.deleteMany({ where: { assignmentId: { in: [assignmentId, otherAssignmentId] } } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId: { in: [assignmentId, otherAssignmentId] } } });
    await prisma.assignment.deleteMany({ where: { id: { in: [assignmentId, otherAssignmentId] } } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentAId, studentBId, studentCId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("flags the renamed-variable pair and excludes the unrelated submission and other assignments", async () => {
    mockAuthenticatedUser(instructorId);
    const { checkSimilarity } = await import("@/app/actions/check-similarity");

    const result = await checkSimilarity(assignmentId);

    expect(result.success).toBe(true);
    const pairs = result.pairs!;

    const studentIdsInPairs = new Set(pairs.flatMap((p) => [p.studentAId, p.studentBId]));
    expect(studentIdsInPairs.has(studentAId)).toBe(true);
    expect(studentIdsInPairs.has(studentBId)).toBe(true);

    const flaggedPair = pairs.find(
      (p) =>
        (p.studentAId === studentAId && p.studentBId === studentBId) ||
        (p.studentAId === studentBId && p.studentBId === studentAId)
    );
    expect(flaggedPair).toBeDefined();
    expect(flaggedPair!.similarity).toBeGreaterThan(0.4);

    // Student C's unrelated code should not appear paired with A or B
    const pairsWithC = pairs.filter((p) => p.studentAId === studentCId || p.studentBId === studentCId);
    expect(pairsWithC).toHaveLength(0);
  });

  it("rejects a caller who does not own the assignment", async () => {
    const otherInstructorId = randomUUID();
    await prisma.user.create({
      data: { id: otherInstructorId, email: `other-${otherInstructorId}@test.com`, role: "instructor" },
    });
    mockAuthenticatedUser(otherInstructorId);
    const { checkSimilarity } = await import("@/app/actions/check-similarity");

    const result = await checkSimilarity(assignmentId);

    expect(result.success).toBe(false);
    await prisma.user.deleteMany({ where: { id: otherInstructorId } });
  });
});
