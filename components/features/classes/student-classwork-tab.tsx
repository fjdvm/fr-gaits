import Link from "next/link";
import { BookOpen } from "lucide-react";

interface StudentAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
}

interface StudentClassworkTabProps {
  assignments: StudentAssignment[];
}

export function StudentClassworkTab({ assignments }: StudentClassworkTabProps) {
  if (assignments.length === 0) {
    return <p className="text-xs text-secondary italic text-center py-10">No assignments posted yet.</p>;
  }

  return (
    <div className="max-w-3xl space-y-3">
      {assignments.map((asm) => (
        <Link
          key={asm.id}
          href={`/dashboard/student/assignments/${asm.id}`}
          className="flex items-center justify-between p-4 bg-white border border-surface-container rounded-2xl hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-on-surface truncate">{asm.title}</p>
              <p className="text-[10px] text-secondary">
                {asm.language} · Due {new Date(asm.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
