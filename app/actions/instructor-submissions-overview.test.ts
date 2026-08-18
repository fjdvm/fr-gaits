import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getInstructorSubmissionsOverview", () => {
  let instructorId: string;
  let studentId: string;
  let activeClassId: string;
  let archivedClassId: string;
  let assignmentInActiveClassId: string;
  let assignmentInArchivedClassId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
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

    const [assignmentA, assignmentB] = await Promise.all([
      prisma.assignment.create({
        data: {
          title: "Active Assignment",
          instructions: "Do it",
          language: "python",
          dueDate: new Date(),
          createdBy: instructorId,
        },
      }),
      prisma.assignment.create({
        data: {
          title: "Archived Assignment",
          instructions: "Do it",
          language: "python",
          dueDate: new Date(),
          createdBy: instructorId,
        },
      }),
    ]);
    assignmentInActiveClassId = assignmentA.id;
    assignmentInArchivedClassId = assignmentB.id;

    await Promise.all([
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInActiveClassId, classId: activeClassId } }),
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInArchivedClassId, classId: archivedClassId } }),
    ]);

    await prisma.submission.create({
      data: {
        studentId,
        assignmentId: assignmentInArchivedClassId,
        code: "print(1)",
        score: 100,
        testResults: {},
        behavioralSignals: {},
      },
    });
  });

  afterEach(async () => {
    await prisma.submission.deleteMany({ where: { studentId } });
    await prisma.assignmentClass.deleteMany({
      where: { assignmentId: { in: [assignmentInActiveClassId, assignmentInArchivedClassId] } },
    });
    await prisma.assignment.deleteMany({ where: { id: { in: [assignmentInActiveClassId, assignmentInArchivedClassId] } } });
    await prisma.class.deleteMany({ where: { id: { in: [activeClassId, archivedClassId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("excludes assignments whose only class is archived", async () => {
    mockAuthenticatedUser(instructorId);
    const { getInstructorSubmissionsOverview } = await import("@/app/actions/instructor-submissions-overview");

    const result = await getInstructorSubmissionsOverview();

    expect(result.success).toBe(true);
    const titles = result.assignments!.map((a) => a.title);
    expect(titles).toContain("Active Assignment");
    expect(titles).not.toContain("Archived Assignment");
  });

  it("excludes archived classes from the class filter list", async () => {
    mockAuthenticatedUser(instructorId);
    const { getInstructorSubmissionsOverview } = await import("@/app/actions/instructor-submissions-overview");

    const result = await getInstructorSubmissionsOverview();

    expect(result.success).toBe(true);
    const classNames = result.classes!.map((c) => c.name);
    expect(classNames).toContain("Active Class");
    expect(classNames).not.toContain("Archived Class");
  });
});
