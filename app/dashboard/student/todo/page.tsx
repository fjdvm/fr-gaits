import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentTodos } from "@/app/actions/student-todos";
import { TodoView } from "@/components/features/dashboard/todo-view";

export default async function StudentTodoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getStudentTodos();
  if (!result.success) redirect("/dashboard/student");

  return <TodoView todos={result.todos!} classes={result.classes!} />;
}
