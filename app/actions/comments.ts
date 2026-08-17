"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

type Visibility = "class" | "private";

export async function createComment(
  postId: string,
  body: string,
  visibility: Visibility,
  targetStudentId?: string
) {
  try {
    if (!postId) throw new Error("Post ID is required");
    if (!body || body.trim() === "") throw new Error("Comment body is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const post = await prisma.post.findUnique({ where: { id: postId }, include: { class: true } });
    if (!post) throw new Error("Post not found");

    const isInstructor = post.class.instructorId === user.id;
    let enrollment = null;
    if (!isInstructor) {
      enrollment = await prisma.enrollment.findUnique({
        where: { studentId_classId: { studentId: user.id, classId: post.classId } },
      });
      if (!enrollment) throw new Error("Unauthorized: You are not a member of this class");
    }

    let threadStudentId: string | null = null;
    if (visibility === "private") {
      if (isInstructor) {
        if (!targetStudentId) throw new Error("A target student is required for an instructor's private reply");
        const targetEnrollment = await prisma.enrollment.findUnique({
          where: { studentId_classId: { studentId: targetStudentId, classId: post.classId } },
        });
        if (!targetEnrollment) throw new Error("The target student is not enrolled in this class");
        threadStudentId = targetStudentId;
      } else {
        threadStudentId = user.id;
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        body: body.trim(),
        visibility,
        threadStudentId,
      },
    });

    if (visibility === "private") {
      if (isInstructor) {
        await createNotification({
          userId: threadStudentId!,
          type: "private_comment",
          title: "Your instructor replied",
          message: body.trim(),
          link: `/dashboard/student/classes/${post.classId}`,
        });
      } else {
        await createNotification({
          userId: post.class.instructorId,
          type: "private_comment",
          title: "New private comment",
          message: body.trim(),
          link: `/dashboard/instructor/classes/${post.classId}`,
        });
      }
    }

    return { success: true, comment };
  } catch (err) {
    console.error("Failed to create comment:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    if (!commentId) throw new Error("Comment ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: { include: { class: true } } },
    });
    if (!comment) throw new Error("Comment not found");

    const isAuthor = comment.authorId === user.id;
    const isInstructor = comment.post.class.instructorId === user.id;
    if (!isAuthor && !isInstructor) {
      throw new Error("Unauthorized: You can only delete your own comments, or moderate as the instructor");
    }

    await prisma.comment.delete({ where: { id: commentId } });

    return { success: true };
  } catch (err) {
    console.error("Failed to delete comment:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
