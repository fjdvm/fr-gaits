import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("leaveClass", () => {
  let instructorId: string;
  let studentId: string;
  let outsiderStudentId: string;
  let classId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentId = randomUUID();
    outsiderStudentId = randomUUID();
    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
        { id: outsiderStudentId, email: `outsider-${outsiderStudentId}@test.com`, role: "student" },
      ],
    });
    const cls = await prisma.class.create({
      data: { name: "Leave Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
    await prisma.enrollment.create({ data: { studentId, classId } });
  });

  afterEach(async () => {
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentId, outsiderStudentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("lets an enrolled student leave the class, removing their enrollment", async () => {
    mockAuthenticatedUser(studentId);
    const { leaveClass } = await import("@/app/actions/leave-class");

    const result = await leaveClass(classId);

    expect(result.success).toBe(true);
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    expect(enrollment).toBeNull();
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    expect(cls).not.toBeNull();
  });

  it("rejects a student who is not enrolled in the class", async () => {
    mockAuthenticatedUser(outsiderStudentId);
    const { leaveClass } = await import("@/app/actions/leave-class");

    const result = await leaveClass(classId);

    expect(result.success).toBe(false);
  });

  it("rejects unauthenticated requests", async () => {
    const { mockUnauthenticated } = await import("../../test/mock-auth");
    mockUnauthenticated();
    const { leaveClass } = await import("@/app/actions/leave-class");

    const result = await leaveClass(classId);

    expect(result.success).toBe(false);
  });
});
