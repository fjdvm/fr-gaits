import { prisma } from "@/lib/prisma";
import { AdminView } from "@/components/features/dashboard/admin-view";

function percentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    pendingInstructors,
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
    prisma.user.findMany({
      where: { role: "instructor", approvalStatus: "pending" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { lt: startOfThisMonth } } }),
    prisma.user.count({ where: { createdAt: { lt: startOfLastMonth } } }),
    prisma.class.count({ where: { archived: false } }),
    prisma.class.count({ where: { archived: false, createdAt: { lt: startOfThisMonth } } }),
    prisma.class.count({ where: { archived: false, createdAt: { lt: startOfLastMonth } } }),
    prisma.submission.count(),
    prisma.submission.count({ where: { submittedAt: { lt: startOfThisMonth } } }),
    prisma.submission.count({ where: { submittedAt: { lt: startOfLastMonth } } }),
  ]);

  const formattedInstructors = pendingInstructors.map((inst) => ({
    id: inst.id,
    email: inst.email,
    createdAt: inst.createdAt.toISOString(),
  }));

  const kpis = {
    totalUsers,
    totalUsersChangePct: percentChange(totalUsers, usersBeforeThisMonth || usersBeforeLastMonth),
    activeClasses,
    activeClassesChangePct: percentChange(activeClasses, activeClassesBeforeThisMonth || activeClassesBeforeLastMonth),
    totalSubmissions,
    totalSubmissionsChangePct: percentChange(totalSubmissions, submissionsBeforeThisMonth || submissionsBeforeLastMonth),
  };

  return <AdminView initialPendingInstructors={formattedInstructors} kpis={kpis} />;
}
