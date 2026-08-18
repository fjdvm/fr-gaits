import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInstructorSubmissionsOverview } from "@/app/actions/instructor-submissions-overview";
import { SubmissionsListView } from "@/components/features/submissions/submissions-list-view";

export default async function InstructorSubmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getInstructorSubmissionsOverview();
  if (!result.success) redirect("/dashboard/instructor");

  return <SubmissionsListView assignments={result.assignments!} classes={result.classes!} />;
}
