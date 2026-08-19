"use client";

import { Heart, Calendar, Cloud, CloudUpload, CloudAlert } from "lucide-react";
import type { AutosaveStatus } from "./use-autosave";

interface WorkspaceHeaderProps {
  title: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  maxHearts: number;
  timeToRegen: string;
  isSubmitted: boolean;
  autosaveStatus: AutosaveStatus;
}

export function WorkspaceHeader({
  title,
  language,
  dueDate,
  heartsCount,
  maxHearts,
  timeToRegen,
  isSubmitted,
  autosaveStatus,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex h-[72px] items-center justify-between px-6 border-b border-surface-container bg-white shrink-0 shadow-sm">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-sm font-bold text-on-surface tracking-tight">{title}</h1>
        <span className="bg-primary-container text-on-primary-container text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider font-mono">
          {language}
        </span>
        {isSubmitted && (
          <span className="bg-[#e6f4ea] text-[#137333] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Submitted
          </span>
        )}
        {!isSubmitted && <AutosaveIndicator status={autosaveStatus} />}
      </div>

      <div className="flex items-center gap-6 text-xs font-bold text-secondary">
        <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-100">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>{heartsCount} / {maxHearts} Hearts</span>
          {timeToRegen && (
            <span className="text-[10px] text-rose-400 font-normal">({timeToRegen})</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-low px-3.5 py-1.5 rounded-xl border border-surface-container">
          <Calendar className="h-4 w-4 text-secondary/70" />
          <span>Due: {new Date(dueDate).toLocaleDateString(undefined, { dateStyle: "medium" })}</span>
        </div>
      </div>
    </header>
  );
}

function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="text-[9px] text-secondary/70 font-bold flex items-center gap-1">
        <CloudUpload className="h-3 w-3 animate-pulse" /> Saving...
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="text-[9px] text-rose-500 font-bold flex items-center gap-1">
        <CloudAlert className="h-3 w-3" /> Save failed
      </span>
    );
  }

  return (
    <span className="text-[9px] text-secondary/70 font-bold flex items-center gap-1">
      <Cloud className="h-3 w-3" /> Saved
    </span>
  );
}
