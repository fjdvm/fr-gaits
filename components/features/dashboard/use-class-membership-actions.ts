import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { archiveClass, unarchiveClass } from "@/app/actions/archive-class";
import { leaveClass } from "@/app/actions/leave-class";
import { deleteClass } from "@/app/actions/delete-class";

interface ClassRef {
  id: string;
  archived: boolean;
}

export function useClassMembershipActions() {
  const router = useRouter();

  const runAction = async (
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
    failureMessage: string
  ) => {
    const result = await action();
    if (result.success) {
      toast.success(successMessage);
      router.refresh();
    } else {
      toast.error(result.error || failureMessage);
    }
  };

  const handleArchiveToggle = (cls: ClassRef) =>
    runAction(
      () => (cls.archived ? unarchiveClass(cls.id) : archiveClass(cls.id)),
      cls.archived ? "Class restored" : "Class archived",
      "Failed to update class"
    );

  const handleLeave = (cls: ClassRef) =>
    runAction(() => leaveClass(cls.id), "You left the class", "Failed to leave class");

  const handleDelete = (cls: ClassRef) =>
    runAction(() => deleteClass(cls.id), "Class deleted", "Failed to delete class");

  return { handleArchiveToggle, handleLeave, handleDelete };
}
