import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAssignmentScoreTable } from "@/app/actions/assignment-score-table";
import { AssignmentScoreTable } from "@/components/features/submissions/assignment-score-table";

interface PageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  const { assignmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getAssignmentScoreTable(assignmentId);
  if (!result.success) redirect("/dashboard/instructor/submissions");

  return (
    <AssignmentScoreTable
      assignmentId={assignmentId}
      assignmentTitle={result.assignmentTitle!}
      students={result.students!}
    />
  );
}
