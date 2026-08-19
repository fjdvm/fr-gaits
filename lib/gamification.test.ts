import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { awardSubmissionXp, getClassXp, getClassLeaderboard, getTotalXp } from "@/lib/gamification";

describe("per-class XP scoping", () => {
  let studentId: string;
  let instructorId: string;
  let classAId: string;
  let classBId: string;
  let assignmentId: string;

  beforeEach(async () => {
    studentId = randomUUID();
    instructorId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
        { id: studentId, email: `student-${studentId}@test.com`, role: "student" },
      ],
    });

    const classA = await prisma.class.create({
      data: { name: "Class A", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    const classB = await prisma.class.create({
      data: { name: "Class B", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classAId = classA.id;
    classBId = classB.id;

    await prisma.enrollment.createMany({
      data: [{ studentId, classId: classAId }, { studentId, classId: classBId }],
    });

    const assignment = await prisma.assignment.create({
      data: {
        title: "Assignment in Class A",
        instructions: "Do the thing",
        language: "Python",
        dueDate: new Date(Date.now() + 86400000),
        createdBy: instructorId,
      },
    });
    assignmentId = assignment.id;
    await prisma.assignmentClass.create({ data: { assignmentId, classId: classAId } });
  });

  afterEach(async () => {
    await prisma.xpEvent.deleteMany({ where: { studentId } });
    await prisma.streak.deleteMany({ where: { studentId } });
    await prisma.assignmentClass.deleteMany({ where: { assignmentId } });
    await prisma.assignment.deleteMany({ where: { id: assignmentId } });
    await prisma.enrollment.deleteMany({ where: { studentId } });
    await prisma.class.deleteMany({ where: { id: { in: [classAId, classBId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [studentId, instructorId] } } });
  });

  it("credits XP earned on an assignment to the class it belongs to", async () => {
    await awardSubmissionXp(studentId, assignmentId, 100, 0);

    const classAXp = await getClassXp(studentId, classAId);
    const classBXp = await getClassXp(studentId, classBId);

    expect(classAXp).toBeGreaterThan(0);
    expect(classBXp).toBe(0);
  });

  it("does not let XP earned in one class leak into another class's leaderboard", async () => {
    await awardSubmissionXp(studentId, assignmentId, 100, 0);

    const leaderboardA = await getClassLeaderboard(classAId);
    const leaderboardB = await getClassLeaderboard(classBId);

    expect(leaderboardA.find((e) => e.studentId === studentId)?.totalXp).toBeGreaterThan(0);
    expect(leaderboardB.find((e) => e.studentId === studentId)?.totalXp).toBe(0);
  });

  it("keeps global total XP as the sum across all classes", async () => {
    await awardSubmissionXp(studentId, assignmentId, 100, 0);

    const classAXp = await getClassXp(studentId, classAId);
    const globalXp = await getTotalXp(studentId);

    expect(globalXp).toBe(classAXp);
  });

  it("fans XP out to every class a shared assignment belongs to", async () => {
    await prisma.assignmentClass.create({ data: { assignmentId, classId: classBId } });

    await awardSubmissionXp(studentId, assignmentId, 100, 0);

    const classAXp = await getClassXp(studentId, classAId);
    const classBXp = await getClassXp(studentId, classBId);

    expect(classAXp).toBeGreaterThan(0);
    expect(classAXp).toBe(classBXp);
  });
});
