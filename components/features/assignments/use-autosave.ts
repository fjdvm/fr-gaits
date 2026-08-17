"use client";

import { useEffect, useRef, useState } from "react";
import { saveDraft } from "@/app/actions/save-draft";

const AUTOSAVE_DELAY_MS = 1200;

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveProps {
  assignmentId: string;
  code: string;
  isSubmitted: boolean;
}

export function useAutosave({ assignmentId, code, isSubmitted }: UseAutosaveProps) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedCodeRef = useRef(code);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    if (isSubmitted) return;
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      lastSavedCodeRef.current = code;
      return;
    }
    if (code === lastSavedCodeRef.current) return;

    setStatus("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      const result = await saveDraft(assignmentId, code);
      if (result.success) {
        lastSavedCodeRef.current = code;
        setStatus("saved");
      } else {
        setStatus("error");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [code, assignmentId, isSubmitted]);

  return { status };
}
