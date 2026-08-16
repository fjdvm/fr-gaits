import { prisma } from "@/lib/prisma";
import { AdminView } from "@/components/features/dashboard/admin-view";

export default async function AdminDashboardPage() {
  const pendingInstructors = await prisma.user.findMany({
    where: {
      role: "instructor",
      approvalStatus: "pending",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedInstructors = pendingInstructors.map((inst) => ({
    id: inst.id,
    email: inst.email,
    createdAt: inst.createdAt.toISOString(),
  }));

  return <AdminView initialPendingInstructors={formattedInstructors} />;
}
