"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getClassLeaderboard } from "@/lib/gamification";

export async function getClassLeaderboardTabData(classId: string) {
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
      if (!enrollment) throw new Error("Unauthorized: You are not a member of this class");
    }

    const fullBoard = await getClassLeaderboard(classId);
    const leaderboard = isInstructor ? fullBoard : fullBoard.slice(0, cls.leaderboardSize);
    const myRank = fullBoard.find((entry) => entry.studentId === user.id)?.rank || 0;

    return { success: true, leaderboard, myRank };
  } catch (err) {
    console.error("Failed to fetch class leaderboard:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
