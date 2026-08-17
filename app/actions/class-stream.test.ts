import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("getClassStream", () => {
  let instructorId: string;
  let studentAId: string;
  let studentBId: string;
  let outsiderId: string;
  let classId: string;
  let postId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentAId = randomUUID();
    studentBId = randomUUID();
    outsiderId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instr-${instructorId}@test.com`, role: "instructor" },
        { id: studentAId, email: `studentA-${studentAId}@test.com`, role: "student" },
        { id: studentBId, email: `studentB-${studentBId}@test.com`, role: "student" },
        { id: outsiderId, email: `outsider-${outsiderId}@test.com`, role: "student" },
      ],
    });
    const cls = await prisma.class.create({
      data: { name: "Stream Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
    await prisma.enrollment.createMany({
      data: [{ studentId: studentAId, classId }, { studentId: studentBId, classId }],
    });

    const post = await prisma.post.create({
      data: { classId, authorId: instructorId, type: "announcement", body: "Welcome!" },
    });
    postId = post.id;

    await prisma.comment.create({
      data: { postId, authorId: studentAId, body: "Private question from A", visibility: "private", threadStudentId: studentAId },
    });
    await prisma.comment.create({
      data: { postId, authorId: studentBId, body: "Private question from B", visibility: "private", threadStudentId: studentBId },
    });
    await prisma.comment.create({
      data: { postId, authorId: studentAId, body: "Class-wide comment from A", visibility: "class" },
    });
  });

  afterEach(async () => {
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.post.deleteMany({ where: { classId } });
    await prisma.enrollment.deleteMany({ where: { classId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentAId, studentBId, outsiderId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("returns posts in reverse-chronological order with class comments visible to any member", async () => {
    mockAuthenticatedUser(studentAId);
    const { getClassStream } = await import("@/app/actions/class-stream");

    const result = await getClassStream(classId);

    expect(result.success).toBe(true);
    expect(result.posts).toHaveLength(1);
    const classComments = result.posts![0].classComments;
    expect(classComments).toHaveLength(1);
    expect(classComments[0].body).toBe("Class-wide comment from A");
  });

  it("shows a student caller only their own private thread, never another student's", async () => {
    mockAuthenticatedUser(studentAId);
    const { getClassStream } = await import("@/app/actions/class-stream");

    const result = await getClassStream(classId);

    const privateThread = result.posts![0].privateThread!;
    expect(privateThread).toHaveLength(1);
    expect(privateThread[0].body).toBe("Private question from A");
    expect(privateThread.some((c) => c.body === "Private question from B")).toBe(false);
  });

  it("shows the instructor every student's private thread, correctly attributed", async () => {
    mockAuthenticatedUser(instructorId);
    const { getClassStream } = await import("@/app/actions/class-stream");

    const result = await getClassStream(classId);

    const threadsByStudent = result.posts![0].privateThreadsByStudent!;
    expect(threadsByStudent[studentAId]).toHaveLength(1);
    expect(threadsByStudent[studentAId][0].body).toBe("Private question from A");
    expect(threadsByStudent[studentBId]).toHaveLength(1);
    expect(threadsByStudent[studentBId][0].body).toBe("Private question from B");
  });

  it("rejects a caller who is neither the instructor nor an enrolled student", async () => {
    mockAuthenticatedUser(outsiderId);
    const { getClassStream } = await import("@/app/actions/class-stream");

    const result = await getClassStream(classId);

    expect(result.success).toBe(false);
  });
});
