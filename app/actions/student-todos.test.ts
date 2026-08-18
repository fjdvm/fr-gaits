import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getStudentTodos", () => {
  let instructorId: string;
  let studentId: string;
  let activeClassId: string;
  let archivedClassId: string;
  let activeAssignmentId: string;
  let archivedAssignmentId: string;

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

    await Promise.all([
      prisma.enrollment.create({ data: { studentId, classId: activeClassId } }),
      prisma.enrollment.create({ data: { studentId, classId: archivedClassId } }),
    ]);

    const [activeAssignment, archivedAssignment] = await Promise.all([
      prisma.assignment.create({
        data: {
          title: "Active Todo",
          instructions: "Do it",
          language: "python",
          dueDate: new Date(),
          createdBy: instructorId,
        },
      }),
      prisma.assignment.create({
        data: {
          title: "Archived Todo",
          instructions: "Do it",
          language: "python",
          dueDate: new Date(),
          createdBy: instructorId,
        },
      }),
    ]);
    activeAssignmentId = activeAssignment.id;
    archivedAssignmentId = archivedAssignment.id;

    await Promise.all([
      prisma.assignmentClass.create({ data: { assignmentId: activeAssignmentId, classId: activeClassId } }),
      prisma.assignmentClass.create({ data: { assignmentId: archivedAssignmentId, classId: archivedClassId } }),
    ]);
  });

  afterEach(async () => {
    await prisma.submission.deleteMany({ where: { studentId } });
    await prisma.assignmentClass.deleteMany({
      where: { assignmentId: { in: [activeAssignmentId, archivedAssignmentId] } },
    });
    await prisma.assignment.deleteMany({ where: { id: { in: [activeAssignmentId, archivedAssignmentId] } } });
    await prisma.enrollment.deleteMany({ where: { classId: { in: [activeClassId, archivedClassId] } } });
    await prisma.class.deleteMany({ where: { id: { in: [activeClassId, archivedClassId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("excludes assignments belonging to an archived class from the to-do list", async () => {
    mockAuthenticatedUser(studentId);
    const { getStudentTodos } = await import("@/app/actions/student-todos");

    const result = await getStudentTodos();

    expect(result.success).toBe(true);
    const titles = result.todos!.map((t) => t.title);
    expect(titles).toContain("Active Todo");
    expect(titles).not.toContain("Archived Todo");
  });

  it("excludes archived classes from the class filter list", async () => {
    mockAuthenticatedUser(studentId);
    const { getStudentTodos } = await import("@/app/actions/student-todos");

    const result = await getStudentTodos();

    expect(result.success).toBe(true);
    const classNames = result.classes!.map((c) => c.name);
    expect(classNames).toContain("Active Class");
    expect(classNames).not.toContain("Archived Class");
  });

  it("excludes an assignment already submitted", async () => {
    await prisma.submission.create({
      data: {
        studentId,
        assignmentId: activeAssignmentId,
        code: "print(1)",
        score: 100,
        testResults: {},
        behavioralSignals: {},
      },
    });
    mockAuthenticatedUser(studentId);
    const { getStudentTodos } = await import("@/app/actions/student-todos");

    const result = await getStudentTodos();

    expect(result.success).toBe(true);
    const titles = result.todos!.map((t) => t.title);
    expect(titles).not.toContain("Active Todo");
  });
});
