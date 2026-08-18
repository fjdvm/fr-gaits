import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TodoView } from "@/components/features/dashboard/todo-view";

export default async function StudentTodoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id, archived: false },
    include: {
      class: {
        include: {
          assignments: {
            include: {
              assignment: {
                include: {
                  submissions: { where: { studentId: user.id } },
                },
              },
            },
          },
        },
      },
    },
  });

  const todos = enrollments
    .flatMap((e) =>
      e.class.assignments
        .filter((ac) => ac.assignment.submissions.length === 0)
        .map((ac) => ({
          id: ac.assignment.id,
          title: ac.assignment.title,
          language: ac.assignment.language,
          dueDate: ac.assignment.dueDate.toISOString(),
          classId: e.class.id,
          className: e.class.name,
        }))
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const classes = enrollments.map((e) => ({ id: e.class.id, name: e.class.name }));

  return <TodoView todos={todos} classes={classes} />;
}
