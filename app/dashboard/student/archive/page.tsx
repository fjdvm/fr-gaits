import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ArchiveView } from "@/components/features/dashboard/archive-view";

export default async function StudentArchivePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id, archived: true },
    select: { archived: true, class: { select: { id: true, name: true } } },
    orderBy: { class: { name: "asc" } },
  });

  const classes = enrollments.map((e) => ({ id: e.class.id, name: e.class.name, archived: e.archived }));

  return <ArchiveView role="student" classes={classes} />;
}
