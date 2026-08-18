"use server";

import { prisma } from "@/lib/prisma";

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getAdminKpis() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const activeSubmissionFilter = { assignment: { classes: { some: { class: { archived: false } } } } };

  const [
    totalUsers,
    usersBeforeThisMonth,
    usersBeforeLastMonth,
    activeClasses,
    activeClassesBeforeThisMonth,
    activeClassesBeforeLastMonth,
    totalSubmissions,
    submissionsBeforeThisMonth,
    submissionsBeforeLastMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { lt: startOfThisMonth } } }),
    prisma.user.count({ where: { createdAt: { lt: startOfLastMonth } } }),
    prisma.class.count({ where: { archived: false } }),
    prisma.class.count({ where: { archived: false, createdAt: { lt: startOfThisMonth } } }),
    prisma.class.count({ where: { archived: false, createdAt: { lt: startOfLastMonth } } }),
    prisma.submission.count({ where: activeSubmissionFilter }),
    prisma.submission.count({ where: { ...activeSubmissionFilter, submittedAt: { lt: startOfThisMonth } } }),
    prisma.submission.count({ where: { ...activeSubmissionFilter, submittedAt: { lt: startOfLastMonth } } }),
  ]);

  return {
    totalUsers,
    totalUsersChangePct: percentChange(totalUsers, usersBeforeThisMonth || usersBeforeLastMonth),
    activeClasses,
    activeClassesChangePct: percentChange(activeClasses, activeClassesBeforeThisMonth || activeClassesBeforeLastMonth),
    totalSubmissions,
    totalSubmissionsChangePct: percentChange(totalSubmissions, submissionsBeforeThisMonth || submissionsBeforeLastMonth),
  };
}
