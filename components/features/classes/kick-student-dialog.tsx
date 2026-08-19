"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface KickStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  studentName: string;
  isKicking?: boolean;
}

export function KickStudentDialog({
  open,
  onOpenChange,
  onConfirm,
  studentName,
  isKicking,
}: KickStudentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove student from class?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove &quot;{studentName}&quot; from this class. They will lose access to assignments and can only rejoin with the class code.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isKicking}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isKicking}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isKicking ? "Removing..." : "Remove Student"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
