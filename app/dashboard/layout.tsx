import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/features/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, email: true },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const role = dbUser.role as "student" | "instructor" | "admin";

  return (
    <DashboardShell role={role} userEmail={dbUser.email}>
      {children}
    </DashboardShell>
  );
}
