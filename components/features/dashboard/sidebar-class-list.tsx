"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, GraduationCap, Archive, ArchiveRestore } from "lucide-react";
import { archiveClass, unarchiveClass } from "@/app/actions/archive-class";
import { archiveEnrollment, unarchiveEnrollment } from "@/app/actions/archive-enrollment";

interface SidebarClass {
  id: string;
  name: string;
  archived: boolean;
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
                href={`${basePath}/${cls.id}`}
                isActive={pathname === `${basePath}/${cls.id}`}
                onArchiveToggle={handleArchiveToggle}
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
  href,
  isActive,
  onArchiveToggle,
  muted,
}: {
  cls: SidebarClass;
  href: string;
  isActive: boolean;
  onArchiveToggle: (cls: SidebarClass) => void;
  muted?: boolean;
}) {
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
      </Link>
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
    </div>
  );
}
