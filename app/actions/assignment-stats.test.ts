import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getAssignmentStats", () => {
  let instructorId: string;
  let studentIds: string[];
  let classId: string;
  let assignmentId: string;
  let testCaseAId: string;
  let testCaseBId: string;
  let dueDate: Date;

  function makeSignals(riskFlag: "Low" | "Medium" | "High" | null) {
    return {
      pasteCount: 0,
      pasteLength: 0,
      keystrokeCount: 100,
      wpm: 20,
      totalFocusTimeSecs: 60,
      events: [],
      ...(riskFlag ? { riskScore: { total: 0, flag: riskFlag, components: {} } } : {}),
    };
  }

  beforeEach(async () => {
    instructorId = randomUUID();
    studentIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        ...studentIds.map((id) => ({ id, email: `student-${id}@test.com`, role: "student" })),
      ],
    });

    const cls = await prisma.class.create({
      data: { name: "Stats Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;

    dueDate = new Date(Date.now() + 86400000);
    const assignment = await prisma.assignment.create({
      data: {
        title: "Stats Assignment",
        instructions: "Do the thing",
        language: "Python",
        dueDate,
        createdBy: instructorId,
        classes: { create: [{ classId }] },
        testCases: {
          create: [
            { input: "1", expectedOutput: "1", visible: true },
            { input: "2", expectedOutput: "2", visible: true },
          ],
        },
      },
      include: { testCases: true },
    });
    assignmentId = assignment.id;
    testCaseAId = assignment.testCases[0].id;
    testCaseBId = assignment.testCases[1].id;

    // Student 0: perfect score, both test cases pass, 0 hints, Low risk, submitted well before due date
    await prisma.submission.create({
      data: {
        studentId: studentIds[0],
        assignmentId,
        code: "code0",
        score: 100,
        testResults: [
          { testCaseId: testCaseAId, passed: true },
          { testCaseId: testCaseBId, passed: true },
        ],
        behavioralSignals: makeSignals("Low"),
        submittedAt: new Date(dueDate.getTime() - 5 * 60 * 60 * 1000),
      },
    });
    await prisma.heartsState.create({
      data: { studentId: studentIds[0], assignmentId, currentCount: 5, totalSpent: 0 },
    });

    // Student 1: 50% score, test case B fails, 1 hint, Medium risk, submitted in the last hour
    await prisma.submission.create({
      data: {
        studentId: studentIds[1],
        assignmentId,
        code: "code1",
        score: 50,
        testResults: [
          { testCaseId: testCaseAId, passed: true },
          { testCaseId: testCaseBId, passed: false },
        ],
        behavioralSignals: makeSignals("Medium"),
        submittedAt: new Date(dueDate.getTime() - 30 * 60 * 1000),
      },
    });
    await prisma.heartsState.create({
      data: { studentId: studentIds[1], assignmentId, currentCount: 4, totalSpent: 1 },
    });

    // Student 2: 0% score, both test cases fail, 4 hints, High risk, submitted in the last hour
    await prisma.submission.create({
      data: {
        studentId: studentIds[2],
        assignmentId,
        code: "code2",
        score: 0,
        testResults: [
          { testCaseId: testCaseAId, passed: false },
          { testCaseId: testCaseBId, passed: false },
        ],
        behavioralSignals: makeSignals("High"),
        submittedAt: new Date(dueDate.getTime() - 10 * 60 * 1000),
      },
    });
    await prisma.heartsState.create({
      data: { studentId: studentIds[2], assignmentId, currentCount: 1, totalSpent: 4 },
    });

    // Student 3: no submission at all -> excluded from all stats
  });

  afterEach(async () => {
    await prisma.heartsState.deleteMany({ where: { assignmentId } });
    await prisma.submission.deleteMany({ where: { assignmentId } });
    await prisma.testCase.deleteMany({ where: { assignmentId } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId } });
    await prisma.assignment.deleteMany({ where: { id: assignmentId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, ...studentIds] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("computes score distribution, most-failed test case, hint correlation, risk counts, and timing spread", async () => {
    mockAuthenticatedUser(instructorId);
    const { getAssignmentStats } = await import("@/app/actions/assignment-stats");

    const result = await getAssignmentStats(assignmentId);

    expect(result.success).toBe(true);
    const stats = result.stats!;

    // Score distribution: average of 100, 50, 0 = 50; median = 50
    expect(stats.averageScore).toBe(50);
    expect(stats.medianScore).toBe(50);
    expect(stats.scoreDistribution).toEqual({ low: 1, mid: 1, high: 1 });

    // Test case B fails twice (students 1 and 2), test case A fails once (student 2)
    expect(stats.mostFailedTestCase).toEqual({ testCaseId: testCaseBId, failCount: 2 });

    // Hint correlation: 0 hints -> avg 100; 1-3 hints -> avg 50; 4+ hints -> avg 0
    expect(stats.hintUsageCorrelation).toEqual([
      { bucket: "0", averageScore: 100 },
      { bucket: "1-3", averageScore: 50 },
      { bucket: "4+", averageScore: 0 },
    ]);

    // Risk flag counts
    expect(stats.riskFlagCounts).toEqual({ Low: 1, Medium: 1, High: 1 });

    // Timing spread: students 1 and 2 submitted within the last hour before the due date (2 of 3)
    expect(stats.submittedInLastHourCount).toBe(2);
    expect(stats.totalSubmissions).toBe(3);
  });

  it("rejects a caller who does not own the assignment", async () => {
    const otherInstructorId = randomUUID();
    await prisma.user.create({
      data: { id: otherInstructorId, email: `other-${otherInstructorId}@test.com`, role: "instructor" },
    });
    mockAuthenticatedUser(otherInstructorId);
    const { getAssignmentStats } = await import("@/app/actions/assignment-stats");

    const result = await getAssignmentStats(assignmentId);

    expect(result.success).toBe(false);
    await prisma.user.deleteMany({ where: { id: otherInstructorId } });
  });
});
