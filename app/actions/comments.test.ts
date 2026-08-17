import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("createComment / deleteComment", () => {
  let instructorId: string;
  let studentAId: string;
  let studentBId: string;
  let classId: string;
  let postId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    studentAId = randomUUID();
    studentBId = randomUUID();

    await prisma.user.createMany({
      data: [
        { id: instructorId, email: `instr-${instructorId}@test.com`, role: "instructor" },
        { id: studentAId, email: `studentA-${studentAId}@test.com`, role: "student" },
        { id: studentBId, email: `studentB-${studentBId}@test.com`, role: "student" },
      ],
    });
    const cls = await prisma.class.create({
      data: { name: "Comment Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
    await prisma.enrollment.createMany({
      data: [{ studentId: studentAId, classId }, { studentId: studentBId, classId }],
    });
    const post = await prisma.post.create({
      data: { classId, authorId: instructorId, type: "announcement", body: "Welcome!" },
    });
    postId = post.id;
  });

  afterEach(async () => {
    await prisma.notification.deleteMany({ where: { userId: { in: [instructorId, studentAId, studentBId] } } });
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.post.deleteMany({ where: { classId } });
    await prisma.enrollment.deleteMany({ where: { classId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: { in: [instructorId, studentAId, studentBId] } } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("lets a student post a class-wide comment visible to all callers", async () => {
    mockAuthenticatedUser(studentAId);
    const { createComment } = await import("@/app/actions/comments");

    const result = await createComment(postId, "Hi everyone", "class");
    expect(result.success).toBe(true);

    const stored = await prisma.comment.findUnique({ where: { id: result.comment!.id } });
    expect(stored?.visibility).toBe("class");
  });

  it("scopes a student's private comment to their own thread regardless of client input", async () => {
    mockAuthenticatedUser(studentAId);
    const { createComment } = await import("@/app/actions/comments");

    const result = await createComment(postId, "Just for the instructor", "private");

    const stored = await prisma.comment.findUnique({ where: { id: result.comment!.id } });
    expect(stored?.threadStudentId).toBe(studentAId);
  });

  it("requires the instructor to target a specific student's thread when replying privately, and rejects a non-enrolled target", async () => {
    mockAuthenticatedUser(instructorId);
    const { createComment } = await import("@/app/actions/comments");

    const outsiderId = randomUUID();
    const result = await createComment(postId, "Reply", "private", outsiderId);

    expect(result.success).toBe(false);
  });

  it("lets a comment's author delete their own comment", async () => {
    mockAuthenticatedUser(studentAId);
    const { createComment, deleteComment } = await import("@/app/actions/comments");
    const created = await createComment(postId, "Delete me", "class");

    const result = await deleteComment(created.comment!.id);

    expect(result.success).toBe(true);
  });

  it("lets the class's instructor delete any comment for moderation", async () => {
    mockAuthenticatedUser(studentAId);
    const { createComment } = await import("@/app/actions/comments");
    const created = await createComment(postId, "Moderate me", "class");

    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
    mockAuthenticatedUser(instructorId);
    const { deleteComment } = await import("@/app/actions/comments");

    const result = await deleteComment(created.comment!.id);

    expect(result.success).toBe(true);
  });

  it("rejects a delete attempt from a caller who is neither the author nor the instructor", async () => {
    mockAuthenticatedUser(studentAId);
    const { createComment } = await import("@/app/actions/comments");
    const created = await createComment(postId, "Not yours", "class");

    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
    mockAuthenticatedUser(studentBId);
    const { deleteComment } = await import("@/app/actions/comments");

    const result = await deleteComment(created.comment!.id);

    expect(result.success).toBe(false);
  });

  it("notifies the instructor exactly once when a student posts a private comment", async () => {
    mockAuthenticatedUser(studentAId);
    const { createComment } = await import("@/app/actions/comments");

    await createComment(postId, "Need help privately", "private");

    const notifications = await prisma.notification.findMany({ where: { userId: instructorId } });
    expect(notifications).toHaveLength(1);
  });

  it("notifies the targeted student exactly once when the instructor replies privately", async () => {
    mockAuthenticatedUser(instructorId);
    const { createComment } = await import("@/app/actions/comments");

    await createComment(postId, "Here's my reply", "private", studentAId);

    const notifications = await prisma.notification.findMany({ where: { userId: studentAId } });
    expect(notifications).toHaveLength(1);
  });

  it("creates zero notifications for a class-wide comment", async () => {
    mockAuthenticatedUser(studentAId);
    const { createComment } = await import("@/app/actions/comments");

    await createComment(postId, "Public comment", "class");

    const notifications = await prisma.notification.findMany({
      where: { userId: { in: [instructorId, studentBId] } },
    });
    expect(notifications).toHaveLength(0);
  });
});
