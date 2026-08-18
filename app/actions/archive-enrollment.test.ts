import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("archiveEnrollment / unarchiveEnrollment", () => {
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
      data: { name: "Archive Enrollment Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
    await prisma.enrollment.create({ data: { studentId, classId } });
  });

  afterEach(async () => {
    await prisma.enrollment.deleteMany({ where: { classId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentId, outsiderStudentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("lets an enrolled student archive their own enrollment", async () => {
    mockAuthenticatedUser(studentId);
    const { archiveEnrollment } = await import("@/app/actions/archive-enrollment");

    const result = await archiveEnrollment(classId);

    expect(result.success).toBe(true);
    expect(result.enrollment?.archived).toBe(true);
  });

  it("lets an enrolled student unarchive their own enrollment", async () => {
    mockAuthenticatedUser(studentId);
    const { archiveEnrollment, unarchiveEnrollment } = await import("@/app/actions/archive-enrollment");

    await archiveEnrollment(classId);
    const result = await unarchiveEnrollment(classId);

    expect(result.success).toBe(true);
    expect(result.enrollment?.archived).toBe(false);
  });

  it("rejects a student who is not enrolled in the class", async () => {
    mockAuthenticatedUser(outsiderStudentId);
    const { archiveEnrollment } = await import("@/app/actions/archive-enrollment");

    const result = await archiveEnrollment(classId);

    expect(result.success).toBe(false);
  });
});
