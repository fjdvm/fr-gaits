import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getSubmissionAnalysis", () => {
  let instructorId: string;
  let studentIds: string[];
  let classId: string;
  let assignmentId: string;
  let testCaseAId: string;
  let testCaseBId: string;

  function makeSignals(riskFlag: "Low" | "Medium" | "High" | null) {
    return {
      pasteCount: 2,
      pasteLength: 40,
      keystrokeCount: 100,
      wpm: 20,
      totalFocusTimeSecs: 300,
      events: [],
      ...(riskFlag ? { riskScore: { total: 10, flag: riskFlag, components: {} } } : {}),
    };
  }

  beforeEach(async () => {
    instructorId = randomUUID();
    studentIds = [randomUUID(), randomUUID(), randomUUID()];

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        ...studentIds.map((id) => ({ id, email: `student-${id}@test.com`, role: "student" })),
      ],
    });

    const cls = await prisma.class.create({
      data: { name: "Analysis Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;

    const assignment = await prisma.assignment.create({
      data: {
        title: "Analysis Assignment",
        instructions: "Do the thing",
        language: "Python",
        dueDate: new Date(Date.now() + 86400000),
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

    // Target student: score 50 (1 of 2 tests pass), Medium risk
    await prisma.submission.create({
      data: {
        studentId: studentIds[0],
        assignmentId,
        code: "def add(a, b):\n    return a + b\n",
        score: 50,
        testResults: [
          { testCaseId: testCaseAId, passed: true },
          { testCaseId: testCaseBId, passed: false },
        ],
        behavioralSignals: makeSignals("Medium"),
      },
    });

    // Nearly identical code to target -> should show up as similar
    await prisma.submission.create({
      data: {
        studentId: studentIds[1],
        assignmentId,
        code: "def add(a, b):\n    return a + b\n",
        score: 100,
        testResults: [
          { testCaseId: testCaseAId, passed: true },
          { testCaseId: testCaseBId, passed: true },
        ],
        behavioralSignals: makeSignals("Low"),
      },
    });

    // Very different code -> should not be similar
    await prisma.submission.create({
      data: {
        studentId: studentIds[2],
        assignmentId,
        code: "class Vehicle:\n    def __init__(self, wheels):\n        self.wheels = wheels\n\n    def describe(self):\n        return f'This vehicle has {self.wheels} wheels'\n",
        score: 0,
        testResults: [
          { testCaseId: testCaseAId, passed: false },
          { testCaseId: testCaseBId, passed: false },
        ],
        behavioralSignals: makeSignals(null),
      },
    });
  });

  afterEach(async () => {
    await prisma.submission.deleteMany({ where: { assignmentId } });
    await prisma.testCase.deleteMany({ where: { assignmentId } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId } });
    await prisma.assignment.deleteMany({ where: { id: assignmentId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, ...studentIds] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("computes accuracy, class comparison, behavioral summary, and similar submissions", async () => {
    mockAuthenticatedUser(instructorId);
    const { getSubmissionAnalysis } = await import("@/app/actions/submission-analysis");

    const result = await getSubmissionAnalysis(assignmentId, studentIds[0]);

    expect(result.success).toBe(true);
    const analysis = result.analysis!;

    expect(analysis.accuracy).toEqual({ score: 50, passedCount: 1, totalCount: 2 });

    // Class average of 50, 100, 0 = 50; target score (50) is >= itself and the 0-scorer -> 2 of 3 = 67th percentile
    expect(analysis.classComparison.classAverageScore).toBe(50);
    expect(analysis.classComparison.totalSubmissions).toBe(3);
    expect(analysis.classComparison.percentileRank).toBe(67);

    expect(analysis.behavioralSummary.riskFlag).toBe("Medium");
    expect(analysis.behavioralSummary.pasteCount).toBe(2);
    expect(analysis.behavioralSummary.wpm).toBe(20);

    expect(analysis.similarSubmissions).toHaveLength(1);
    expect(analysis.similarSubmissions[0].studentId).toBe(studentIds[1]);
    expect(analysis.similarSubmissions[0].similarity).toBeGreaterThan(0);
  }, 20000);

  it("rejects a caller who does not own the assignment", async () => {
    const otherInstructorId = randomUUID();
    await prisma.user.create({
      data: { id: otherInstructorId, email: `other-${otherInstructorId}@test.com`, role: "instructor" },
    });
    mockAuthenticatedUser(otherInstructorId);
    const { getSubmissionAnalysis } = await import("@/app/actions/submission-analysis");

    const result = await getSubmissionAnalysis(assignmentId, studentIds[0]);

    expect(result.success).toBe(false);
    await prisma.user.deleteMany({ where: { id: otherInstructorId } });
  });

  it("errors when the target student has no submission", async () => {
    mockAuthenticatedUser(instructorId);
    const { getSubmissionAnalysis } = await import("@/app/actions/submission-analysis");

    const unsubmittedStudentId = randomUUID();
    await prisma.user.create({
      data: { id: unsubmittedStudentId, email: `unsubmitted-${unsubmittedStudentId}@test.com`, role: "student" },
    });

    const result = await getSubmissionAnalysis(assignmentId, unsubmittedStudentId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Submission not found");
    await prisma.user.deleteMany({ where: { id: unsubmittedStudentId } });
  });
});
