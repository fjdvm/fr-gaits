import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

describe("getAdminKpis", () => {
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
        data: { title: "Active Assignment", instructions: "Do it", language: "python", dueDate: new Date(), createdBy: instructorId },
      }),
      prisma.assignment.create({
        data: { title: "Archived Assignment", instructions: "Do it", language: "python", dueDate: new Date(), createdBy: instructorId },
      }),
    ]);
    assignmentInActiveClassId = assignmentA.id;
    assignmentInArchivedClassId = assignmentB.id;

    await Promise.all([
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInActiveClassId, classId: activeClassId } }),
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInArchivedClassId, classId: archivedClassId } }),
    ]);
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
  });

  it("counts only submissions for assignments that still have an active class link", async () => {
    const totalBeforeFixtures = await prisma.submission.count({
      where: { assignment: { classes: { some: { class: { archived: false } } } } },
    });

    await Promise.all([
      prisma.submission.create({
        data: { studentId, assignmentId: assignmentInActiveClassId, code: "print(1)", score: 100, testResults: {}, behavioralSignals: {} },
      }),
      prisma.submission.create({
        data: { studentId, assignmentId: assignmentInArchivedClassId, code: "print(1)", score: 100, testResults: {}, behavioralSignals: {} },
      }),
    ]);

    const { getAdminKpis } = await import("@/app/actions/admin-kpis");
    const kpis = await getAdminKpis();

    // Two submissions were added: one for an assignment linked only to an
    // active class, one for an assignment linked only to an archived class.
    // Only the active-class one should count, so the KPI must be exactly
    // 1 higher than the baseline (itself scoped to active-class assignments,
    // since unrelated real data may exist in the shared test database).
    expect(kpis.totalSubmissions).toBe(totalBeforeFixtures + 1);
  });
});
