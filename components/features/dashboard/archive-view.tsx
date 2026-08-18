"use client";

import { ArchiveX } from "lucide-react";
import { DashboardHeader } from "./dashboard-header";
import { ClassLink } from "./sidebar-class-list";
import { useClassMembershipActions } from "./use-class-membership-actions";

interface ArchivedClass {
  id: string;
  name: string;
  archived: boolean;
  classArchived?: boolean;
}

interface ArchiveViewProps {
  role: "student" | "instructor";
  classes: ArchivedClass[];
}

export function ArchiveView({ role, classes }: ArchiveViewProps) {
  const basePath = role === "instructor" ? "/dashboard/instructor/classes" : "/dashboard/student/classes";
  const { handleArchiveToggle, handleLeave, handleDelete } = useClassMembershipActions();

  return (
    <>
      <DashboardHeader
        title="Archive"
        description={
          role === "instructor"
            ? "Classes you've archived. Restore one to bring it back to your active list."
            : "Classes your instructor has archived. Leave one if you no longer need it."
        }
      />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        {classes.length === 0 ? (
          <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center max-w-3xl w-full">
            <ArchiveX className="h-12 w-12 text-secondary/30 mb-4" />
            <h3 className="font-bold text-lg">No archived classes</h3>
            <p className="text-xs text-secondary mt-1">
              {role === "instructor" ? "Classes you archive will show up here." : "Classes your instructor archives will show up here."}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl w-full bg-white border border-surface-container rounded-[24px] p-4">
            {classes.map((cls) => (
              <ClassLink
                key={cls.id}
                cls={cls}
                role={role}
                href={`${basePath}/${cls.id}`}
                isActive={false}
                onArchiveToggle={role === "instructor" ? handleArchiveToggle : undefined}
                onLeave={role === "student" ? handleLeave : undefined}
                onDelete={role === "instructor" ? handleDelete : undefined}
                muted
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
