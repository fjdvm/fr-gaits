import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { SubmissionsListView } from "@/components/features/submissions/submissions-list-view";

export default async function InstructorSubmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const assignments = await prisma.assignment.findMany({
    where: { createdBy: user.id },
    include: {
      classes: { include: { class: { select: { id: true, name: true } } } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedAssignments = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    language: a.language,
    dueDate: a.dueDate.toISOString(),
    classes: a.classes.map((c) => ({ id: c.class.id, name: c.class.name })),
    submissionCount: a._count.submissions,
  }));

  const classes = await prisma.class.findMany({
    where: { instructorId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <SubmissionsListView assignments={formattedAssignments} classes={classes} />;
}
