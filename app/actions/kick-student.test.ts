import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("kickStudent", () => {
  let instructorId: string;
  let studentId: string;
  let classId: string;

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
      data: { name: "Kick Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;

    await prisma.enrollment.create({
      data: { studentId, classId },
    });
  });

  afterEach(async () => {
    await prisma.enrollment.deleteMany({ where: { classId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("removes the student enrollment for the owning instructor", async () => {
    mockAuthenticatedUser(instructorId);
    const { kickStudent } = await import("@/app/actions/kick-student");

    const result = await kickStudent(classId, studentId);

    expect(result.success).toBe(true);

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    expect(enrollment).toBeNull();
  });

  it("rejects a caller who does not own the class", async () => {
    const otherInstructorId = randomUUID();
    await prisma.user.create({
      data: { id: otherInstructorId, email: `other-${otherInstructorId}@test.com`, role: "instructor" },
    });
    mockAuthenticatedUser(otherInstructorId);
    const { kickStudent } = await import("@/app/actions/kick-student");

    const result = await kickStudent(classId, studentId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    expect(enrollment).not.toBeNull();

    await prisma.user.deleteMany({ where: { id: otherInstructorId } });
  });

  it("errors when the student is not enrolled", async () => {
    mockAuthenticatedUser(instructorId);
    const { kickStudent } = await import("@/app/actions/kick-student");

    const nonEnrolledId = randomUUID();
    await prisma.user.create({
      data: { id: nonEnrolledId, email: `non-${nonEnrolledId}@test.com`, role: "student" },
    });

    const result = await kickStudent(classId, nonEnrolledId);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Student is not enrolled in this class");

    await prisma.user.deleteMany({ where: { id: nonEnrolledId } });
  });
});
