import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";
import type { BehavioralSignals } from "@/lib/types/behavioral-signals";

describe("submitCode behavioral signals", () => {
  let studentId: string;
  let instructorId: string;
  let classId: string;
  let assignmentId: string;
  const originalFetch = global.fetch;

  beforeEach(async () => {
    studentId = randomUUID();
    instructorId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
      ],
    });

    const cls = await prisma.class.create({
      data: { name: "Signals Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;

    const assignment = await prisma.assignment.create({
      data: {
        title: "Signals Assignment",
        instructions: "Do the thing",
        language: "Python",
        dueDate: new Date(Date.now() + 86400000),
        createdBy: instructorId,
        classes: { create: [{ classId }] },
      },
    });
    assignmentId = assignment.id;

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        stdout: "",
        stderr: "",
        compile_output: "",
        status: { id: 3, description: "Accepted" },
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(async () => {
    await prisma.submission.deleteMany({ where: { assignmentId } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId } });
    await prisma.assignment.deleteMany({ where: { id: assignmentId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [studentId, instructorId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
    global.fetch = originalFetch;
  });

  it("stores the event log and a computed risk score alongside the existing aggregates", async () => {
    mockAuthenticatedUser(studentId);
    const { submitCode } = await import("@/app/actions/submit-code");

    const signals: BehavioralSignals = {
      pasteCount: 1,
      pasteLength: 40,
      keystrokeCount: 5,
      wpm: 10,
      totalFocusTimeSecs: 30,
      tabSwitchCount: 0,
      events: [
        { type: "paste", timestamp: 0, length: 40, charsAtTimeOfPaste: 0 },
        { type: "submit", timestamp: 5_000 },
      ],
    };

    const result = await submitCode(assignmentId, "print('hello world')", signals);

    expect(result.success).toBe(true);

    const stored = await prisma.submission.findUnique({
      where: { studentId_assignmentId: { studentId, assignmentId } },
    });
    const storedSignals = stored!.behavioralSignals as any;

    expect(storedSignals.events).toEqual(signals.events);
    expect(storedSignals.pasteCount).toBe(1);
    expect(storedSignals.riskScore).toBeDefined();
    expect(storedSignals.riskScore.flag).toBeDefined();
    expect(typeof storedSignals.riskScore.total).toBe("number");
  });

  it("does not let the risk score affect the submission's score", async () => {
    mockAuthenticatedUser(studentId);
    const { submitCode } = await import("@/app/actions/submit-code");

    const signals: BehavioralSignals = {
      pasteCount: 1,
      pasteLength: 1000,
      keystrokeCount: 0,
      wpm: 0,
      totalFocusTimeSecs: 5,
      tabSwitchCount: 0,
      events: [
        { type: "paste", timestamp: 0, length: 1000, charsAtTimeOfPaste: 0 },
        { type: "submit", timestamp: 1_000 },
      ],
    };

    const result = await submitCode(assignmentId, "print('hello world')", signals);

    expect(result.success).toBe(true);
    // score is driven entirely by test-case pass rate (mocked Judge0 always "Accepted"), not by risk
    expect(result.submission!.score).toBe(100);
  });
});
