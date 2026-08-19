import Link from "next/link";
import { Calendar, Heart, Code, Trash2 } from "lucide-react";

interface InstructorAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  heartsRegenMinutes: number;
  classNames: string[];
  testCaseCount: number;
}

interface AssignmentCardProps {
  assignment: InstructorAssignment;
  onDelete: (assignment: InstructorAssignment) => void;
}

export function AssignmentCard({ assignment: asm, onDelete }: AssignmentCardProps) {
  return (
    <Link
      href={`/dashboard/instructor/submissions/${asm.id}`}
      className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container flex flex-col relative overflow-hidden group hover:border-outline-variant hover:shadow-md transition-all"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="bg-primary-container/10 p-3 rounded-xl">
          <Code className="h-6 w-6 text-primary" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="bg-surface-container-low text-on-surface px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-surface-container font-mono uppercase">
            {asm.language}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(asm);
            }}
            title="Delete assignment"
            className="p-1.5 rounded-lg text-secondary hover:text-red-600 hover:bg-surface-container-low transition-colors cursor-pointer border border-surface-container"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="mb-4 relative z-10 flex-grow">
        <h4 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors">{asm.title}</h4>
        <p className="text-[10px] text-secondary flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          Due: {new Date(asm.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-surface-container grid grid-cols-3 gap-2 text-center relative z-10">
        <div className="bg-surface-container-low p-2 rounded-xl border border-surface-container">
          <span className="block text-[9px] text-secondary font-bold uppercase">Classes</span>
          <span className="block text-xs font-bold text-on-surface mt-0.5 truncate" title={asm.classNames.join(", ")}>
            {asm.classNames.join(", ") || "None"}
          </span>
        </div>
        <div className="bg-surface-container-low p-2 rounded-xl border border-surface-container">
          <span className="block text-[9px] text-secondary font-bold uppercase">Test Cases</span>
          <span className="block text-xs font-bold text-on-surface mt-0.5">{asm.testCaseCount}</span>
        </div>
        <div className="bg-surface-container-low p-2 rounded-xl border border-surface-container">
          <span className="block text-[9px] text-secondary font-bold uppercase flex items-center justify-center gap-0.5">
            <Heart className="h-2.5 w-2.5 fill-destructive text-destructive" /> Hearts
          </span>
          <span className="block text-[10px] font-bold text-on-surface mt-0.5 leading-none">
            {asm.heartsCount} ({asm.heartsRegenMinutes}m)
          </span>
        </div>
      </div>
    </Link>
  );
}
