"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAssignment } from "@/app/actions/delete-assignment";

interface AssignmentToDelete {
  id: string;
  title: string;
}

export function useAssignmentActions() {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<AssignmentToDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDelete = (assignment: AssignmentToDelete) => {
    setPendingDelete(assignment);
  };

  const cancelDelete = () => {
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const result = await deleteAssignment(pendingDelete.id);
    if (result.success) {
      toast.success("Assignment deleted");
      setPendingDelete(null);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete assignment");
    }
    setIsDeleting(false);
  };

  return { pendingDelete, isDeleting, requestDelete, cancelDelete, confirmDelete };
}
