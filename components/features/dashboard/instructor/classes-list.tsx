"use client";

import { useState } from "react";
import { School, Plus } from "lucide-react";
import { useClassActions, type InstructorClass } from "./components/use-class-actions";
import { InstructorClassCard } from "./components/instructor-class-card";

interface ClassesListProps {
  initialClasses: InstructorClass[];
  archivedClasses: InstructorClass[];
}

export function ClassesList({ initialClasses, archivedClasses }: ClassesListProps) {
  const [className, setClassName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const { isCreatingClass, handleCreateClass, handleArchiveToggle, handleDelete, copyToClipboard } = useClassActions();

  const onCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || className.trim() === "") {
      return;
    }
    const created = await handleCreateClass(className);
    if (created) setClassName("");
  };

  const visibleClasses = showArchived ? archivedClasses : initialClasses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Classes List</h2>
        <form onSubmit={onCreateClass} className="flex gap-2 w-full sm:w-auto shrink-0 bg-white p-3 rounded-2xl border border-surface-container shadow-sm">
          <input
            placeholder="Class name (e.g. CS101)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={isCreatingClass}
            className="w-full sm:w-48 bg-surface-container-low rounded-xl px-4 py-2 text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow"
          />
          <button
            type="submit"
            disabled={isCreatingClass}
            className="px-5 py-2 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {isCreatingClass ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="flex bg-surface-container-low p-1 rounded-xl border border-surface-container w-max">
        <button
          onClick={() => setShowArchived(false)}
          className={`px-4 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
            !showArchived ? "bg-white text-on-surface shadow-sm" : "text-secondary hover:text-on-surface"
          }`}
        >
          Active ({initialClasses.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          className={`px-4 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
            showArchived ? "bg-white text-on-surface shadow-sm" : "text-secondary hover:text-on-surface"
          }`}
        >
          Archived ({archivedClasses.length})
        </button>
      </div>

      {visibleClasses.length === 0 ? (
        <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center">
          <School className="h-12 w-12 text-secondary/30 mb-4" />
          <h3 className="font-bold text-lg">{showArchived ? "No archived classes" : "No classes created"}</h3>
          <p className="text-xs text-secondary mt-1 max-w-sm">
            {showArchived
              ? "Classes you archive will show up here."
              : "Use the form to create your first class and get a join code for students."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleClasses.map((cls) => (
            <InstructorClassCard
              key={cls.id}
              cls={cls}
              onArchiveToggle={handleArchiveToggle}
              onDelete={handleDelete}
              onCopyJoinCode={copyToClipboard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
