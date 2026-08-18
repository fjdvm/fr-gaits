"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, GraduationCap, Archive, ArchiveRestore, LogOut, Trash2 } from "lucide-react";
import { archiveClass, unarchiveClass } from "@/app/actions/archive-class";
import { archiveEnrollment, unarchiveEnrollment } from "@/app/actions/archive-enrollment";
import { leaveClass } from "@/app/actions/leave-class";
import { deleteClass } from "@/app/actions/delete-class";

interface SidebarClass {
  id: string;
  name: string;
  archived: boolean;
  classArchived?: boolean;
}

interface SidebarClassListProps {
  role: "student" | "instructor" | "admin";
  classes: SidebarClass[];
  collapsed: boolean;
}

export function SidebarClassList({ role, classes, collapsed }: SidebarClassListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sectionOpen, setSectionOpen] = useState(true);

  if (role === "admin" || collapsed) return null;

  const basePath = role === "instructor" ? "/dashboard/instructor/classes" : "/dashboard/student/classes";
  const sectionLabel = role === "instructor" ? "Teaching" : "Enrolled";
  const active = classes.filter((c) => !c.archived);

  const handleArchiveToggle = async (cls: SidebarClass) => {
    const result =
      role === "instructor"
        ? cls.archived
          ? await unarchiveClass(cls.id)
          : await archiveClass(cls.id)
        : cls.archived
          ? await unarchiveEnrollment(cls.id)
          : await archiveEnrollment(cls.id);

    if (result.success) {
      toast.success(cls.archived ? "Class restored" : "Class archived");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update class");
    }
  };

  const handleLeave = async (cls: SidebarClass) => {
    const result = await leaveClass(cls.id);
    if (result.success) {
      toast.success("You left the class");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to leave class");
    }
  };

  const handleDelete = async (cls: SidebarClass) => {
    const result = await deleteClass(cls.id);
    if (result.success) {
      toast.success("Class deleted");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete class");
    }
  };

  return (
    <div className="px-8 mt-8">
      <button
        onClick={() => setSectionOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary/70 hover:text-on-surface transition-colors mb-2 px-0 cursor-pointer w-full"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${sectionOpen ? "" : "-rotate-90"}`} />
        {sectionLabel}
      </button>

      {sectionOpen && (
        <div className="flex flex-col">
          {active.length === 0 ? (
            <p className="text-xs text-secondary italic">No classes yet</p>
          ) : (
            active.map((cls) => (
              <ClassLink
                key={cls.id}
                cls={cls}
                role={role}
                href={`${basePath}/${cls.id}`}
                isActive={pathname === `${basePath}/${cls.id}`}
                onArchiveToggle={handleArchiveToggle}
                onLeave={handleLeave}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ClassLink({
  cls,
  role,
  href,
  isActive,
  onArchiveToggle,
  onLeave,
  onDelete,
  muted,
}: {
  cls: SidebarClass;
  role?: "student" | "instructor" | "admin";
  href: string;
  isActive: boolean;
  onArchiveToggle: (cls: SidebarClass) => void;
  onLeave?: (cls: SidebarClass) => void;
  onDelete?: (cls: SidebarClass) => void;
  muted?: boolean;
}) {
  const isStudent = role !== "instructor";
  const instructorArchived = isStudent && cls.classArchived;

  return (
    <div className="flex items-center gap-1">
      <Link
        href={href}
        className={`flex items-center gap-2 py-2 text-sm truncate transition-colors flex-1 min-w-0 ${
          isActive ? "font-bold text-on-surface" : muted ? "text-secondary/70 hover:text-on-surface" : "text-secondary hover:text-on-surface"
        }`}
      >
        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{cls.name}</span>
        {instructorArchived && (
          <span className="shrink-0 text-[9px] font-bold uppercase text-secondary/60 border border-surface-container rounded px-1">
            Archived by instructor
          </span>
        )}
      </Link>

      {!instructorArchived && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onArchiveToggle(cls);
          }}
          title={cls.archived ? "Restore class" : "Archive class"}
          className="shrink-0 text-secondary/60 hover:text-on-surface transition-colors cursor-pointer p-1 rounded-md hover:bg-surface-container-high"
        >
          {cls.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
        </button>
      )}

      {isStudent && onLeave && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm(`Leave "${cls.name}"? You'll need the join code to enroll again.`)) {
              onLeave(cls);
            }
          }}
          title="Leave class"
          className="shrink-0 text-secondary/60 hover:text-red-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-surface-container-high"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      )}

      {!isStudent && onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm(`Delete "${cls.name}"? This permanently removes the class, its assignments links, and student enrollments. This cannot be undone.`)) {
              onDelete(cls);
            }
          }}
          title="Delete class"
          className="shrink-0 text-secondary/60 hover:text-red-600 transition-colors cursor-pointer p-1 rounded-md hover:bg-surface-container-high"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
