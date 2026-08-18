import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getAssignmentScoreTable", () => {
  let instructorId: string;
  let outsiderInstructorId: string;
  let activeStudentId: string;
  let archivedStudentId: string;
  let activeClassId: string;
  let archivedClassId: string;
  let assignmentId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    outsiderInstructorId = randomUUID();
    activeStudentId = randomUUID();
    archivedStudentId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: outsiderInstructorId, email: `outsider-${outsiderInstructorId}@test.com`, role: "instructor" },
        { id: activeStudentId, email: `active-${activeStudentId}@test.com`, role: "student" },
        { id: archivedStudentId, email: `archived-${archivedStudentId}@test.com`, role: "student" },
      ],
    });

    const [activeClass, archivedClass] = await Promise.all([
      prisma.class.create({
        data: { name: "Active Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
      }),
      prisma.class.create({
        data: { name: "Archived Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase(), archived: true },
      }),
    ]);
    activeClassId = activeClass.id;
    archivedClassId = archivedClass.id;

    await Promise.all([
      prisma.enrollment.create({ data: { studentId: activeStudentId, classId: activeClassId } }),
      prisma.enrollment.create({ data: { studentId: archivedStudentId, classId: archivedClassId } }),
    ]);

    const assignment = await prisma.assignment.create({
      data: {
        title: "Shared Assignment",
        instructions: "Do it",
        language: "python",
        dueDate: new Date(),
        createdBy: instructorId,
      },
    });
    assignmentId = assignment.id;

    await Promise.all([
      prisma.assignmentClass.create({ data: { assignmentId, classId: activeClassId } }),
      prisma.assignmentClass.create({ data: { assignmentId, classId: archivedClassId } }),
    ]);

    await prisma.submission.create({
      data: {
        studentId: archivedStudentId,
        assignmentId,
        code: "print(1)",
        score: 100,
        testResults: {},
        behavioralSignals: {},
      },
    });
  });

  afterEach(async () => {
    await prisma.submission.deleteMany({ where: { assignmentId } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId } });
    await prisma.assignment.deleteMany({ where: { id: assignmentId } });
    await prisma.enrollment.deleteMany({ where: { classId: { in: [activeClassId, archivedClassId] } } });
    await prisma.class.deleteMany({ where: { id: { in: [activeClassId, archivedClassId] } } });
    await prisma.user.deleteMany({
      where: { id: { in: [instructorId, outsiderInstructorId, activeStudentId, archivedStudentId] } },
    });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("excludes students whose class has been archived", async () => {
    mockAuthenticatedUser(instructorId);
    const { getAssignmentScoreTable } = await import("@/app/actions/assignment-score-table");

    const result = await getAssignmentScoreTable(assignmentId);

    expect(result.success).toBe(true);
    const studentIds = result.students!.map((s) => s.studentId);
    expect(studentIds).toContain(activeStudentId);
    expect(studentIds).not.toContain(archivedStudentId);
  });

  it("rejects an instructor who does not own the assignment", async () => {
    mockAuthenticatedUser(outsiderInstructorId);
    const { getAssignmentScoreTable } = await import("@/app/actions/assignment-score-table");

    const result = await getAssignmentScoreTable(assignmentId);

    expect(result.success).toBe(false);
  });
});
