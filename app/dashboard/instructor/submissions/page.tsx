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
      classes: { include: { class: { select: { name: true } } } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedAssignments = assignments.map((a) => ({
    id: a.id,
    title: a.title,
    language: a.language,
    dueDate: a.dueDate.toISOString(),
    classNames: a.classes.map((c) => c.class.name),
    submissionCount: a._count.submissions,
  }));

  return <SubmissionsListView assignments={formattedAssignments} />;
}
