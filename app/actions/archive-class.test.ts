import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("archiveClass / unarchiveClass", () => {
  let instructorId: string;
  let outsiderInstructorId: string;
  let classId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    outsiderInstructorId = randomUUID();
    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: outsiderInstructorId, email: `outsider-${outsiderInstructorId}@test.com`, role: "instructor" },
      ],
    });
    const cls = await prisma.class.create({
      data: { name: "Archive Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
  });

  afterEach(async () => {
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, outsiderInstructorId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("lets the owning instructor archive their class", async () => {
    mockAuthenticatedUser(instructorId);
    const { archiveClass } = await import("@/app/actions/archive-class");

    const result = await archiveClass(classId);

    expect(result.success).toBe(true);
    expect(result.class?.archived).toBe(true);
  });

  it("lets the owning instructor unarchive their class", async () => {
    mockAuthenticatedUser(instructorId);
    const { archiveClass, unarchiveClass } = await import("@/app/actions/archive-class");

    await archiveClass(classId);
    const result = await unarchiveClass(classId);

    expect(result.success).toBe(true);
    expect(result.class?.archived).toBe(false);
  });

  it("rejects an instructor who does not own the class", async () => {
    mockAuthenticatedUser(outsiderInstructorId);
    const { archiveClass } = await import("@/app/actions/archive-class");

    const result = await archiveClass(classId);

    expect(result.success).toBe(false);
  });
});
