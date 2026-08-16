import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getClassLeaderboard, getTotalXp, computeLevel } from "@/lib/gamification";
import { LeaderboardView } from "@/components/features/gamification/leaderboard-view";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: { class: { select: { id: true, name: true, leaderboardSize: true } } },
  });

  const classLeaderboards = await Promise.all(
    enrollments.map(async (e) => {
      const fullBoard = await getClassLeaderboard(e.class.id);
      const myEntry = fullBoard.find((entry) => entry.studentId === user.id);
      const publicBoard = fullBoard.slice(0, e.class.leaderboardSize);
      return {
        classId: e.class.id,
        className: e.class.name,
        leaderboard: publicBoard,
        myRank: myEntry?.rank || 0,
        myXp: myEntry?.totalXp || 0,
      };
    })
  );

  const totalXp = await getTotalXp(user.id);
  const levelInfo = computeLevel(totalXp);
  const streak = await prisma.streak.findUnique({ where: { studentId: user.id } });
  const badges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: { badge: true },
  });

  return (
    <LeaderboardView
      classLeaderboards={classLeaderboards}
      totalXp={totalXp}
      level={levelInfo.level}
      currentLevelXp={levelInfo.currentXp}
      nextLevelXp={levelInfo.nextThreshold}
      currentStreak={streak?.currentStreak || 0}
      badges={badges.map((ub) => ({ name: ub.badge.name, description: ub.badge.description, earnedAt: ub.earnedAt.toISOString() }))}
    />
  );
}
