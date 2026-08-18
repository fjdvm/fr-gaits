import Link from "next/link";
import { School, Copy, Users, Calendar, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import type { InstructorClass } from "./use-class-actions";

interface InstructorClassCardProps {
  cls: InstructorClass;
  onArchiveToggle: (cls: InstructorClass) => void;
  onDelete: (cls: InstructorClass) => void;
  onCopyJoinCode: (code: string) => void;
}

export function InstructorClassCard({ cls, onArchiveToggle, onDelete, onCopyJoinCode }: InstructorClassCardProps) {
  return (
    <Link
      href={`/dashboard/instructor/classes/${cls.id}`}
      className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container flex flex-col relative overflow-hidden group hover:border-outline-variant transition-colors"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="bg-primary-container/10 p-3 rounded-xl">
          <School className="h-6 w-6 text-primary" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="bg-surface-container-low text-secondary px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-surface-container">
            {cls.archived ? "Archived" : "Active"}
          </span>
        </div>
      </div>
      <div className="mb-4 relative z-10">
        <h4 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors">{cls.name}</h4>
        <p className="text-[10px] text-secondary flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Created: {new Date(cls.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="mt-auto pt-4 border-t border-surface-container flex justify-between items-center relative z-10">
        <div className="flex items-center gap-1.5 text-secondary text-xs">
          <Users className="h-4 w-4" />
          <span>{cls.studentCount} students</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCopyJoinCode(cls.joinCode);
            }}
            className="bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-surface-container"
          >
            Code: {cls.joinCode}
            <Copy className="h-3 w-3 text-secondary" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onArchiveToggle(cls);
            }}
            title={cls.archived ? "Restore class" : "Archive class"}
            className="p-2 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer border border-surface-container"
          >
            {cls.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(cls);
            }}
            title="Delete class"
            className="p-2 rounded-xl text-secondary hover:text-red-600 hover:bg-surface-container-low transition-colors cursor-pointer border border-surface-container"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}
