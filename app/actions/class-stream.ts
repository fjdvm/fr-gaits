"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

interface CommentView {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export async function getClassStream(classId: string) {
  try {
    if (!classId) throw new Error("Class ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");

    const isInstructor = cls.instructorId === user.id;
    if (!isInstructor) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { studentId_classId: { studentId: user.id, classId } },
      });
      if (!enrollment) {
        throw new Error("Unauthorized: You are not a member of this class");
      }
    }

    const posts = await prisma.post.findMany({
      where: { classId },
      include: { comments: true },
      orderBy: { createdAt: "desc" },
    });

    const toView = (c: { id: string; authorId: string; body: string; createdAt: Date }): CommentView => ({
      id: c.id,
      authorId: c.authorId,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    });

    const formattedPosts = posts.map((post) => {
      const classComments = post.comments.filter((c) => c.visibility === "class").map(toView);

      if (isInstructor) {
        const privateThreadsByStudent: Record<string, CommentView[]> = {};
        for (const c of post.comments) {
          if (c.visibility !== "private" || !c.threadStudentId) continue;
          if (!privateThreadsByStudent[c.threadStudentId]) privateThreadsByStudent[c.threadStudentId] = [];
          privateThreadsByStudent[c.threadStudentId].push(toView(c));
        }
        return {
          id: post.id,
          type: post.type,
          body: post.body,
          linkUrl: post.linkUrl,
          assignmentId: post.assignmentId,
          authorId: post.authorId,
          createdAt: post.createdAt.toISOString(),
          classComments,
          privateThreadsByStudent,
        };
      }

      const privateThread = post.comments
        .filter((c) => c.visibility === "private" && c.threadStudentId === user.id)
        .map(toView);

      return {
        id: post.id,
        type: post.type,
        body: post.body,
        linkUrl: post.linkUrl,
        assignmentId: post.assignmentId,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        classComments,
        privateThread,
      };
    });

    return { success: true, posts: formattedPosts };
  } catch (err) {
    console.error("Failed to fetch class stream:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
