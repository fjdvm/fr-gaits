import { prisma } from "@/lib/prisma";
import { getAdminKpis } from "@/app/actions/admin-kpis";
import { AdminView } from "@/components/features/dashboard/admin-view";

export default async function AdminDashboardPage() {
  const pendingInstructors = await prisma.user.findMany({
    where: { role: "instructor", approvalStatus: "pending" },
    orderBy: { createdAt: "desc" },
  });

  const formattedInstructors = pendingInstructors.map((inst) => ({
    id: inst.id,
    email: inst.email,
    createdAt: inst.createdAt.toISOString(),
  }));

  const kpis = await getAdminKpis();

  return <AdminView initialPendingInstructors={formattedInstructors} kpis={kpis} />;
}
