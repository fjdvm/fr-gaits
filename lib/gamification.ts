import { prisma } from "./prisma";

const XP_VALUES = {
  pass_case: 10,
  perfect_score: 50,
  no_hints: 30,
  fewer_hints: 15,
  streak_maintained: 20,
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000];

export function computeLevel(totalXp: number): { level: number; currentXp: number; nextThreshold: number } {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return { level, currentXp: totalXp - currentThreshold, nextThreshold: nextThreshold - currentThreshold };
}

export async function getTotalXp(studentId: string): Promise<number> {
  const result = await prisma.xpEvent.aggregate({ where: { studentId }, _sum: { xpAmount: true } });
  return result._sum.xpAmount || 0;
}

function getISOWeekYear(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return d.getFullYear() * 100 + weekNum;
}

export async function awardSubmissionXp(studentId: string, assignmentId: string, score: number, totalHintsUsed: number) {
  const events: { eventType: string; xpAmount: number }[] = [];

  if (score > 0) {
    const casesXp = Math.round((score / 100) * 5) * XP_VALUES.pass_case;
    events.push({ eventType: "pass_case", xpAmount: casesXp });
  }
  if (score === 100) events.push({ eventType: "perfect_score", xpAmount: XP_VALUES.perfect_score });
  if (totalHintsUsed === 0) events.push({ eventType: "no_hints", xpAmount: XP_VALUES.no_hints });
  else if (totalHintsUsed <= 2) events.push({ eventType: "fewer_hints", xpAmount: XP_VALUES.fewer_hints });

  // Streak check
  const currentWeekYear = getISOWeekYear(new Date());
  let streak = await prisma.streak.findUnique({ where: { studentId } });
  if (!streak) {
    streak = await prisma.streak.create({ data: { studentId, currentStreak: 1, lastSubmissionWeek: currentWeekYear } });
    events.push({ eventType: "streak_maintained", xpAmount: XP_VALUES.streak_maintained });
  } else {
    const lastWeek = streak.lastSubmissionWeek;
    if (currentWeekYear === lastWeek) {
      // Same week, streak already counted
    } else if (currentWeekYear - lastWeek === 1 || (currentWeekYear % 100 === 1 && lastWeek % 100 >= 52)) {
      // Consecutive week
      await prisma.streak.update({ where: { studentId }, data: { currentStreak: streak.currentStreak + 1, lastSubmissionWeek: currentWeekYear } });
      events.push({ eventType: "streak_maintained", xpAmount: XP_VALUES.streak_maintained });
    } else {
      // Streak broken - reset
      await prisma.streak.update({ where: { studentId }, data: { currentStreak: 1, lastSubmissionWeek: currentWeekYear } });
    }
  }

  // Save XP events
  if (events.length > 0) {
    await prisma.xpEvent.createMany({
      data: events.map((e) => ({ studentId, assignmentId, eventType: e.eventType, xpAmount: e.xpAmount })),
    });
  }

  // Check and award badges
  await checkAndAwardBadges(studentId);

  return events;
}

async function checkAndAwardBadges(studentId: string) {
  const submissionCount = await prisma.submission.count({ where: { studentId } });
  const perfectCount = await prisma.submission.count({ where: { studentId, score: 100 } });
  const noHintsSubmissions = await prisma.submission.count({
    where: { studentId, score: { gt: 0 } },
  });
  const streak = await prisma.streak.findUnique({ where: { studentId } });
  const totalXp = await getTotalXp(studentId);

  const conditions: Record<string, boolean> = {
    first_submit: submissionCount >= 1,
    perfect_score: perfectCount >= 1,
    five_perfect: perfectCount >= 5,
    streak_5: (streak?.currentStreak || 0) >= 5,
    streak_10: (streak?.currentStreak || 0) >= 10,
    xp_1000: totalXp >= 1000,
    xp_5000: totalXp >= 5000,
  };

  const allBadges = await prisma.badge.findMany();
  const earnedBadgeIds = (await prisma.userBadge.findMany({ where: { userId: studentId }, select: { badgeId: true } })).map(b => b.badgeId);

  for (const badge of allBadges) {
    if (earnedBadgeIds.includes(badge.id)) continue;
    if (conditions[badge.condition]) {
      await prisma.userBadge.create({ data: { userId: studentId, badgeId: badge.id } });
    }
  }
}

export async function getClassLeaderboard(classId: string, limit?: number) {
  const enrollments = await prisma.enrollment.findMany({
    where: { classId },
    select: { studentId: true, student: { select: { email: true } } },
  });

  const leaderboard = await Promise.all(
    enrollments.map(async (e) => {
      const totalXp = await getTotalXp(e.studentId);
      const levelInfo = computeLevel(totalXp);
      return { studentId: e.studentId, email: e.student.email, totalXp, level: levelInfo.level };
    })
  );

  leaderboard.sort((a, b) => b.totalXp - a.totalXp);

  const ranked = leaderboard.map((entry, index) => ({ ...entry, rank: index + 1 }));
  return limit ? ranked.slice(0, limit) : ranked;
}
