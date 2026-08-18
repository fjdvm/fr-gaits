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
    select: { role: true, email: true, name: true },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const role = dbUser.role as "student" | "instructor" | "admin";

  let sidebarClasses: { id: string; name: string; archived: boolean; classArchived: boolean }[] = [];
  if (role === "instructor") {
    const classes = await prisma.class.findMany({
      where: { instructorId: user.id },
      select: { id: true, name: true, archived: true },
      orderBy: { createdAt: "desc" },
    });
    sidebarClasses = classes.map((c) => ({ ...c, classArchived: c.archived }));
  } else if (role === "student") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.id },
      select: { archived: true, class: { select: { id: true, name: true, archived: true } } },
      orderBy: { enrolledAt: "desc" },
    });
    sidebarClasses = enrollments.map((e) => ({
      id: e.class.id,
      name: e.class.name,
      archived: e.archived || e.class.archived,
      classArchived: e.class.archived,
    }));
  }

  return (
    <DashboardShell role={role} userEmail={dbUser.email} userName={dbUser.name} classes={sidebarClasses}>
      {children}
    </DashboardShell>
  );
}
