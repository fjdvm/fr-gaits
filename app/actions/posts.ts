"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function createPost(classId: string, body: string, linkUrl?: string) {
  try {
    if (!classId) throw new Error("Class ID is required");
    if (!body || body.trim() === "") throw new Error("Post body is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");
    if (cls.instructorId !== user.id) {
      throw new Error("Unauthorized: Only the class's instructor can post announcements");
    }

    const post = await prisma.post.create({
      data: {
        classId,
        authorId: user.id,
        type: "announcement",
        body: body.trim(),
        linkUrl: linkUrl?.trim() || null,
      },
    });

    return { success: true, post };
  } catch (err) {
    console.error("Failed to create post:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deletePost(postId: string) {
  try {
    if (!postId) throw new Error("Post ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error("Post not found");
    if (post.authorId !== user.id) {
      throw new Error("Unauthorized: You can only delete your own posts");
    }

    await prisma.post.delete({ where: { id: postId } });

    return { success: true };
  } catch (err) {
    console.error("Failed to delete post:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
