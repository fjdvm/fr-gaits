import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getClassRoster", () => {
  let instructorId: string;
  let studentId: string;
  let outsiderInstructorId: string;
  let outsiderStudentId: string;
  let classId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentId = randomUUID();
    outsiderInstructorId = randomUUID();
    outsiderStudentId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
        { id: outsiderInstructorId, email: `outsider-instr-${outsiderInstructorId}@test.com`, role: "instructor" },
        { id: outsiderStudentId, email: `outsider-student-${outsiderStudentId}@test.com`, role: "student" },
      ],
    });
    const cls = await prisma.class.create({
      data: { name: "Roster Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
    await prisma.enrollment.create({ data: { studentId, classId } });
  });

  afterEach(async () => {
    await prisma.enrollment.deleteMany({ where: { classId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({
      where: { id: { in: [instructorId, studentId, outsiderInstructorId, outsiderStudentId] } },
    });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("lets the class's instructor fetch the roster", async () => {
    mockAuthenticatedUser(instructorId);
    const { getClassRoster } = await import("@/app/actions/class-roster");

    const result = await getClassRoster(classId);

    expect(result.success).toBe(true);
    expect(result.students).toHaveLength(1);
    expect(result.students![0].id).toBe(studentId);
  });

  it("lets an enrolled student fetch the roster", async () => {
    mockAuthenticatedUser(studentId);
    const { getClassRoster } = await import("@/app/actions/class-roster");

    const result = await getClassRoster(classId);

    expect(result.success).toBe(true);
  });

  it("rejects a student who is not enrolled in the class", async () => {
    mockAuthenticatedUser(outsiderStudentId);
    const { getClassRoster } = await import("@/app/actions/class-roster");

    const result = await getClassRoster(classId);

    expect(result.success).toBe(false);
  });

  it("rejects an instructor who does not own the class", async () => {
    mockAuthenticatedUser(outsiderInstructorId);
    const { getClassRoster } = await import("@/app/actions/class-roster");

    const result = await getClassRoster(classId);

    expect(result.success).toBe(false);
  });
});
