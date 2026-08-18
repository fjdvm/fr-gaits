import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getInstructorAssignments", () => {
  let instructorId: string;
  let activeClassId: string;
  let archivedClassId: string;
  let assignmentInActiveClassId: string;
  let assignmentInArchivedClassId: string;
  let assignmentInBothClassesId: string;

  beforeEach(async () => {
    instructorId = randomUUID();

    await prisma.user.create({
      data: { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
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

    const [assignmentA, assignmentB, assignmentC] = await Promise.all([
      prisma.assignment.create({
        data: { title: "Active-only Assignment", instructions: "Do it", language: "python", dueDate: new Date(), createdBy: instructorId },
      }),
      prisma.assignment.create({
        data: { title: "Archived-only Assignment", instructions: "Do it", language: "python", dueDate: new Date(), createdBy: instructorId },
      }),
      prisma.assignment.create({
        data: { title: "Shared Assignment", instructions: "Do it", language: "python", dueDate: new Date(), createdBy: instructorId },
      }),
    ]);
    assignmentInActiveClassId = assignmentA.id;
    assignmentInArchivedClassId = assignmentB.id;
    assignmentInBothClassesId = assignmentC.id;

    await Promise.all([
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInActiveClassId, classId: activeClassId } }),
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInArchivedClassId, classId: archivedClassId } }),
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInBothClassesId, classId: activeClassId } }),
      prisma.assignmentClass.create({ data: { assignmentId: assignmentInBothClassesId, classId: archivedClassId } }),
    ]);
  });

  afterEach(async () => {
    await prisma.assignmentClass.deleteMany({
      where: { assignmentId: { in: [assignmentInActiveClassId, assignmentInArchivedClassId, assignmentInBothClassesId] } },
    });
    await prisma.assignment.deleteMany({
      where: { id: { in: [assignmentInActiveClassId, assignmentInArchivedClassId, assignmentInBothClassesId] } },
    });
    await prisma.class.deleteMany({ where: { id: { in: [activeClassId, archivedClassId] } } });
    await prisma.user.deleteMany({ where: { id: instructorId } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("excludes an assignment whose only class is archived", async () => {
    mockAuthenticatedUser(instructorId);
    const { getInstructorAssignments } = await import("@/app/actions/instructor-assignments");

    const result = await getInstructorAssignments();

    expect(result.success).toBe(true);
    const titles = result.assignments!.map((a) => a.title);
    expect(titles).toContain("Active-only Assignment");
    expect(titles).not.toContain("Archived-only Assignment");
  });

  it("keeps an assignment shared with an active class, but hides the archived class from its class list", async () => {
    mockAuthenticatedUser(instructorId);
    const { getInstructorAssignments } = await import("@/app/actions/instructor-assignments");

    const result = await getInstructorAssignments();

    const shared = result.assignments!.find((a) => a.title === "Shared Assignment");
    expect(shared).toBeDefined();
    expect(shared!.classNames).toEqual(["Active Class"]);
  });
});
