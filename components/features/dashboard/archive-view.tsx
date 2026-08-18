"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArchiveX } from "lucide-react";
import { archiveClass, unarchiveClass } from "@/app/actions/archive-class";
import { archiveEnrollment, unarchiveEnrollment } from "@/app/actions/archive-enrollment";
import { DashboardHeader } from "./dashboard-header";
import { ClassLink } from "./sidebar-class-list";

interface ArchivedClass {
  id: string;
  name: string;
  archived: boolean;
}

interface ArchiveViewProps {
  role: "student" | "instructor";
  classes: ArchivedClass[];
}

export function ArchiveView({ role, classes }: ArchiveViewProps) {
  const router = useRouter();
  const basePath = role === "instructor" ? "/dashboard/instructor/classes" : "/dashboard/student/classes";

  const handleRestore = async (cls: ArchivedClass) => {
    const result = role === "instructor" ? await unarchiveClass(cls.id) : await unarchiveEnrollment(cls.id);
    if (result.success) {
      toast.success("Class restored");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to restore class");
    }
  };

  const handleArchiveToggle = async (cls: ArchivedClass) => {
    if (cls.archived) {
      await handleRestore(cls);
      return;
    }
    const result = role === "instructor" ? await archiveClass(cls.id) : await archiveEnrollment(cls.id);
    if (result.success) {
      toast.success("Class archived");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to archive class");
    }
  };

  return (
    <>
      <DashboardHeader title="Archive" description="Classes you've archived. Restore one to bring it back to your active list." />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        {classes.length === 0 ? (
          <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center max-w-3xl w-full">
            <ArchiveX className="h-12 w-12 text-secondary/30 mb-4" />
            <h3 className="font-bold text-lg">No archived classes</h3>
            <p className="text-xs text-secondary mt-1">Classes you archive will show up here.</p>
          </div>
        ) : (
          <div className="max-w-3xl w-full bg-white border border-surface-container rounded-[24px] p-4">
            {classes.map((cls) => (
              <ClassLink
                key={cls.id}
                cls={cls}
                href={`${basePath}/${cls.id}`}
                isActive={false}
                onArchiveToggle={handleArchiveToggle}
                muted
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
