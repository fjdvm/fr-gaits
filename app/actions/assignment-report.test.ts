import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

const generateTextMock = vi.fn();

vi.mock("ai", async () => {
  const actual = await vi.importActual<typeof import("ai")>("ai");
  return { ...actual, generateText: generateTextMock };
});

vi.mock("@/lib/ai-provider", () => ({
  getModelWithFallback: vi.fn().mockResolvedValue({ modelId: "fake-model" }),
}));

describe("generateAssignmentReport", () => {
  let instructorId: string;
  let studentId: string;
  let classId: string;
  let assignmentId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
      ],
    });

    const cls = await prisma.class.create({
      data: { name: "Report Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;

    const assignment = await prisma.assignment.create({
      data: {
        title: "Report Assignment",
        instructions: "Do the thing",
        language: "Python",
        dueDate: new Date(Date.now() + 86400000),
        createdBy: instructorId,
        classes: { create: [{ classId }] },
      },
    });
    assignmentId = assignment.id;

    await prisma.submission.create({
      data: {
        studentId,
        assignmentId,
        code: "print('hi')",
        score: 80,
        testResults: [{ testCaseId: "tc-1", passed: true }],
        behavioralSignals: {
          pasteCount: 0,
          pasteLength: 0,
          keystrokeCount: 10,
          wpm: 10,
          totalFocusTimeSecs: 30,
          events: [],
        },
      },
    });

    generateTextMock.mockReset();
    generateTextMock.mockResolvedValue({ text: "The class did reasonably well overall." });
  });

  afterEach(async () => {
    await prisma.submission.deleteMany({ where: { assignmentId } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId } });
    await prisma.assignment.deleteMany({ where: { id: assignmentId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("passes the computed stats prompt to the model and persists the narrative", async () => {
    mockAuthenticatedUser(instructorId);
    const { generateAssignmentReport } = await import("@/app/actions/assignment-report");

    const result = await generateAssignmentReport(assignmentId);

    expect(result.success).toBe(true);
    expect(result.narrative).toBe("The class did reasonably well overall.");

    expect(generateTextMock).toHaveBeenCalledTimes(1);
    const callArgs = generateTextMock.mock.calls[0][0];
    expect(callArgs.prompt).toContain("80");
    expect(callArgs.prompt).not.toContain("print('hi')");

    const stored = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    expect(stored!.statsReportNarrative).toBe("The class did reasonably well overall.");
    expect(stored!.statsReportGeneratedAt).not.toBeNull();
  });

  it("does not call the model again on a second request once cached, unless explicitly regenerated", async () => {
    mockAuthenticatedUser(instructorId);
    const { generateAssignmentReport } = await import("@/app/actions/assignment-report");

    await generateAssignmentReport(assignmentId);
    expect(generateTextMock).toHaveBeenCalledTimes(1);

    await generateAssignmentReport(assignmentId);
    expect(generateTextMock).toHaveBeenCalledTimes(1);

    await generateAssignmentReport(assignmentId, { forceRegenerate: true });
    expect(generateTextMock).toHaveBeenCalledTimes(2);
  });

  it("rejects a caller who does not own the assignment", async () => {
    const otherInstructorId = randomUUID();
    await prisma.user.create({
      data: { id: otherInstructorId, email: `other-${otherInstructorId}@test.com`, role: "instructor" },
    });
    mockAuthenticatedUser(otherInstructorId);
    const { generateAssignmentReport } = await import("@/app/actions/assignment-report");

    const result = await generateAssignmentReport(assignmentId);

    expect(result.success).toBe(false);
    await prisma.user.deleteMany({ where: { id: otherInstructorId } });
  });
});
