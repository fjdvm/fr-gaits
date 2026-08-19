import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClass } from "@/app/actions/create-class";
import { archiveClass, unarchiveClass } from "@/app/actions/archive-class";
import { deleteClass } from "@/app/actions/delete-class";

export interface InstructorClass {
  id: string;
  name: string;
  joinCode: string;
  studentCount: number;
  createdAt: string;
  archived: boolean;
}

export function useClassActions() {
  const router = useRouter();
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  const handleCreateClass = async (className: string) => {
    setIsCreatingClass(true);
    try {
      const result = await createClass(className);
      if (result.success && result.class) {
        toast.success(`Class "${className}" created successfully!`);
        router.refresh();
        return true;
      }
      toast.error(result.error || "Failed to create class");
      return false;
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
      return false;
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleArchiveToggle = async (cls: InstructorClass) => {
    const result = cls.archived ? await unarchiveClass(cls.id) : await archiveClass(cls.id);
    if (result.success) {
      toast.success(cls.archived ? "Class restored" : "Class archived");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update class");
    }
  };

  const handleDelete = async (cls: InstructorClass) => {
    if (!window.confirm(`Delete "${cls.name}"? This permanently removes the class, its assignments links, and student enrollments. This cannot be undone.`)) {
      return;
    }
    const result = await deleteClass(cls.id);
    if (result.success) {
      toast.success("Class deleted");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete class");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Join code copied to clipboard!");
  };

  return { isCreatingClass, handleCreateClass, handleArchiveToggle, handleDelete, copyToClipboard };
}
