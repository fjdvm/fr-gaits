import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("deleteClass", () => {
  let instructorId: string;
  let outsiderInstructorId: string;
  let studentId: string;
  let classId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    outsiderInstructorId = randomUUID();
    studentId = randomUUID();
    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: outsiderInstructorId, email: `outsider-${outsiderInstructorId}@test.com`, role: "instructor" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
      ],
    });
    const cls = await prisma.class.create({
      data: { name: "Delete Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
    await prisma.enrollment.create({ data: { studentId, classId } });
  });

  afterEach(async () => {
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, outsiderInstructorId, studentId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("lets the owning instructor delete their class and cascades enrollments", async () => {
    mockAuthenticatedUser(instructorId);
    const { deleteClass } = await import("@/app/actions/delete-class");

    const result = await deleteClass(classId);

    expect(result.success).toBe(true);
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    expect(cls).toBeNull();
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId, classId } },
    });
    expect(enrollment).toBeNull();
  });

  it("rejects an instructor who does not own the class", async () => {
    mockAuthenticatedUser(outsiderInstructorId);
    const { deleteClass } = await import("@/app/actions/delete-class");

    const result = await deleteClass(classId);

    expect(result.success).toBe(false);
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    expect(cls).not.toBeNull();
  });

  it("rejects unauthenticated requests", async () => {
    const { mockUnauthenticated } = await import("../../test/mock-auth");
    mockUnauthenticated();
    const { deleteClass } = await import("@/app/actions/delete-class");

    const result = await deleteClass(classId);

    expect(result.success).toBe(false);
  });
});
