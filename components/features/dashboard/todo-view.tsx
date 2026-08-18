"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, ListTodo } from "lucide-react";
import { DashboardHeader } from "./dashboard-header";
import { ClassFilter } from "./class-filter";

interface TodoAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  classId: string;
  className: string;
}

interface ClassOption {
  id: string;
  name: string;
}

interface TodoViewProps {
  todos: TodoAssignment[];
  classes: ClassOption[];
}

export function TodoView({ todos, classes }: TodoViewProps) {
  const [selectedClassId, setSelectedClassId] = useState("all");

  const visibleTodos = useMemo(
    () => (selectedClassId === "all" ? todos : todos.filter((t) => t.classId === selectedClassId)),
    [todos, selectedClassId]
  );

  return (
    <>
      <DashboardHeader title="To-do" description="Assignments you haven't submitted yet, across all your classes.">
        {classes.length > 0 && (
          <ClassFilter
            classes={classes}
            selectedClassId={selectedClassId}
            onChange={setSelectedClassId}
            label="Filter to-do by class"
          />
        )}
      </DashboardHeader>
      <main className="flex-grow overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        {visibleTodos.length === 0 ? (
          <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center max-w-3xl w-full">
            <CheckCircle2 className="h-12 w-12 text-primary/40 mb-4" />
            <h3 className="font-bold text-lg">You&apos;re all caught up</h3>
            <p className="text-xs text-secondary mt-1">
              {selectedClassId === "all" ? "No pending assignments right now." : "No pending assignments for this class."}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl w-full space-y-3">
            {visibleTodos.map((todo) => {
              const isOverdue = new Date(todo.dueDate).getTime() < new Date().getTime();
              return (
                <Link
                  key={todo.id}
                  href={`/dashboard/student/assignments/${todo.id}`}
                  className="flex items-center justify-between p-4 bg-white border border-surface-container rounded-2xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                      <ListTodo className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-on-surface truncate">{todo.title}</p>
                      <p className="text-[10px] text-secondary">
                        {todo.className} · {todo.language}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isOverdue ? "bg-destructive/10 text-destructive" : "bg-surface-container-low text-secondary"
                    }`}
                  >
                    <CalendarDays className="h-3 w-3" />
                    {new Date(todo.dueDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
