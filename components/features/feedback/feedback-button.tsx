"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { FeedbackModal } from "./feedback-modal";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Report an issue"
        className="fixed bottom-6 right-6 z-[9999] w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}
