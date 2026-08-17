import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { mockAuthenticatedUser } from "../../test/mock-auth";

describe("createPost", () => {
  let instructorId: string;
  let classId: string;

  beforeEach(async () => {
    instructorId = randomUUID();
    await prisma.user.create({
      data: { id: instructorId, email: `instructor-${instructorId}@test.com`, role: "instructor" },
    });
    const cls = await prisma.class.create({
      data: { name: "Test Class", instructorId, joinCode: randomUUID().slice(0, 6).toUpperCase() },
    });
    classId = cls.id;
  });

  afterEach(async () => {
    await prisma.post.deleteMany({ where: { classId } });
    await prisma.class.deleteMany({ where: { id: classId } });
    await prisma.user.deleteMany({ where: { id: instructorId } });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
  });

  it("lets the class's instructor post an announcement", async () => {
    mockAuthenticatedUser(instructorId);
    const { createPost } = await import("@/app/actions/posts");

    const result = await createPost(classId, "Welcome to the class!", "https://example.com/syllabus");

    expect(result.success).toBe(true);
  });

  it("rejects a caller who is not the class's instructor", async () => {
    const outsiderId = randomUUID();
    await prisma.user.create({
      data: { id: outsiderId, email: `outsider-${outsiderId}@test.com`, role: "instructor" },
    });

    mockAuthenticatedUser(outsiderId);
    const { createPost } = await import("@/app/actions/posts");

    const result = await createPost(classId, "I shouldn't be able to post this");

    expect(result.success).toBe(false);
    await prisma.user.deleteMany({ where: { id: outsiderId } });
  });

  it("lets the authoring instructor delete their own post", async () => {
    mockAuthenticatedUser(instructorId);
    const { createPost, deletePost } = await import("@/app/actions/posts");

    const created = await createPost(classId, "Temporary announcement");
    const result = await deletePost(created.post!.id);

    expect(result.success).toBe(true);
  });

  it("rejects a delete attempt from a caller who did not author the post", async () => {
    mockAuthenticatedUser(instructorId);
    const { createPost } = await import("@/app/actions/posts");
    const created = await createPost(classId, "Another announcement");

    const impostorId = randomUUID();
    await prisma.user.create({
      data: { id: impostorId, email: `impostor-${impostorId}@test.com`, role: "instructor" },
    });
    vi.resetModules();
    vi.doUnmock("@/lib/supabase/server");
    mockAuthenticatedUser(impostorId);
    const { deletePost } = await import("@/app/actions/posts");

    const result = await deletePost(created.post!.id);

    expect(result.success).toBe(false);
    await prisma.user.deleteMany({ where: { id: impostorId } });
  });
});
