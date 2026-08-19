"use client";

import { useState } from "react";
import { BarChart2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatsDashboard } from "../stats-dashboard";
import { SimilarityCheckPanel } from "../similarity-check-panel";

interface StudentInfo {
  studentId: string;
  email: string;
  name: string | null;
}

interface ToolsRailProps {
  assignmentId: string;
  students: StudentInfo[];
  similarityMatchCount: number | null;
  onSimilarityResult: (count: number) => void;
}

type ActivePanel = "stats" | "similarity" | null;

export function ToolsRail({
  assignmentId,
  students,
  similarityMatchCount,
  onSimilarityResult,
}: ToolsRailProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  return (
    <>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end justify-end gap-3">
        <RailButton
          icon={<BarChart2 className="h-4 w-4" />}
          label="Generate Stats"
          onClick={() => setActivePanel("stats")}
        />
        <RailButton
          icon={<ShieldAlert className="h-4 w-4" />}
          label="Check Similar Submissions"
          onClick={() => setActivePanel("similarity")}
        />
      </div>

      <Sheet
        open={activePanel === "stats"}
        onOpenChange={(open) => !open && setActivePanel(null)}
      >
        <SheetContent
          side="right"
          className="data-[side=right]:w-full data-[side=right]:sm:w-1/2 data-[side=right]:lg:w-2/5 data-[side=right]:xl:w-1/3 sm:max-w-none data-[side=right]:sm:max-w-none overflow-y-auto p-6"
        >
          <SheetHeader className="px-0">
            <SheetTitle>Class Stats Dashboard</SheetTitle>
          </SheetHeader>
          <StatsDashboard
            assignmentId={assignmentId}
            similarityMatchCount={similarityMatchCount}
          />
        </SheetContent>
      </Sheet>

      <Sheet
        open={activePanel === "similarity"}
        onOpenChange={(open) => !open && setActivePanel(null)}
      >
        <SheetContent
          side="right"
          className="data-[side=right]:w-full data-[side=right]:sm:w-1/2 data-[side=right]:lg:w-2/5 data-[side=right]:xl:w-1/3 sm:max-w-none data-[side=right]:sm:max-w-none overflow-y-auto p-6"
        >
          <SheetHeader className="px-0">
            <SheetTitle>Code Similarity Check</SheetTitle>
          </SheetHeader>
          <SimilarityCheckPanel
            assignmentId={assignmentId}
            students={students}
            onResult={(pairs) => onSimilarityResult(pairs.length)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

function RailButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      className="group h-10 w-10 hover:w-auto justify-center gap-0 hover:gap-2 overflow-hidden rounded-full px-0 hover:px-2.5 shadow-md transition-all duration-200 bg-gradient-to-r from-primary to-primary-container text-on-primary hover:from-primary hover:to-primary border-0"
    >
      <span className="shrink-0">{icon}</span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-bold opacity-0 transition-all duration-200 group-hover:max-w-xs group-hover:opacity-100">
        {label}
      </span>
    </Button>
  );
}
