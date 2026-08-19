import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getClassLeaderboardTabData", () => {
  let instructorId: string;
  let studentAId: string;
  let studentBId: string;
  let outsiderId: string;
  let classId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentAId = randomUUID();
    studentBId = randomUUID();
    outsiderId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentAId, email: `a-${studentAId}@test.com`, role: "student" },
        { id: studentBId, email: `b-${studentBId}@test.com`, role: "student" },
        { id: outsiderId, email: `outsider-${outsiderId}@test.com`, role: "student" },
      ],
    });
    const cls = await prisma.class.create({
      data: { name: "Leaderboard Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase(), leaderboardSize: 10 },
    });
    classId = cls.id;
    await prisma.enrollment.createMany({ data: [{ studentId: studentAId, classId }, { studentId: studentBId, classId }] });
    await prisma.xpEvent.createMany({
      data: [
        { studentId: studentAId, classId, eventType: "pass_case", xpAmount: 100 },
        { studentId: studentBId, classId, eventType: "pass_case", xpAmount: 50 },
      ],
    });
  });

  afterEach(async () => {
    await prisma.xpEvent.deleteMany({ where: { studentId: { in: [studentAId, studentBId] } } });
    await prisma.enrollment.deleteMany({ where: { classId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentAId, studentBId, outsiderId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("ranks enrolled students by XP within the class, highest first", async () => {
    mockAuthenticatedUser(instructorId);
    const { getClassLeaderboardTabData } = await import("@/app/actions/class-leaderboard");

    const result = await getClassLeaderboardTabData(classId);

    expect(result.success).toBe(true);
    expect(result.leaderboard).toHaveLength(2);
    expect(result.leaderboard![0].studentId).toBe(studentAId);
    expect(result.leaderboard![0].rank).toBe(1);
    expect(result.leaderboard![1].studentId).toBe(studentBId);
    expect(result.leaderboard![1].rank).toBe(2);
  });

  it("lets an enrolled student view the class leaderboard and reports their own rank", async () => {
    mockAuthenticatedUser(studentBId);
    const { getClassLeaderboardTabData } = await import("@/app/actions/class-leaderboard");

    const result = await getClassLeaderboardTabData(classId);

    expect(result.success).toBe(true);
    expect(result.myRank).toBe(2);
  });

  it("rejects a caller who is neither the instructor nor enrolled in the class", async () => {
    mockAuthenticatedUser(outsiderId);
    const { getClassLeaderboardTabData } = await import("@/app/actions/class-leaderboard");

    const result = await getClassLeaderboardTabData(classId);

    expect(result.success).toBe(false);
  });
});
