"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WorkspaceHeaderProps {
  title: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  maxHearts: number;
  timeToRegen: string;
  isSubmitted: boolean;
}

export function WorkspaceHeader({
  title,
  language,
  dueDate,
  heartsCount,
  maxHearts,
  timeToRegen,
  isSubmitted,
}: WorkspaceHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900 shrink-0">
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href="/dashboard/student"
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
        >
          &larr; Back to Dashboard
        </Link>
        <span className="text-zinc-650">|</span>
        <h1 className="text-sm font-bold tracking-tight">{title}</h1>
        <span className="bg-zinc-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
          {language}
        </span>
        {isSubmitted && (
          <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
            Submitted
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-rose-500">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="m11.645 20.91l-.007-.003c-.022-.012-.045-.025-.069-.04a22.066 22.066 0 0 1-2.036-1.423c-.76-.613-1.6-1.39-2.384-2.28C5.972 15.93 5 14.477 5 12.674c0-2.623 2.122-4.674 4.707-4.674c1.19 0 2.247.455 3.043 1.2c.796-.745 1.85-1.2 3.043-1.2c2.585 0 4.707 2.122 4.707 4.674c0 1.803-.972 3.256-2.148 4.293a22.063 22.063 0 0 1-2.453 1.86a4.268 4.268 0 0 1-.07.042l-.008.003l-.002.001c-.13.067-.32.067-.45 0z" />
          </svg>
          <span>{heartsCount} Hearts</span>
          {timeToRegen && (
            <span className="text-[10px] text-zinc-500 font-normal">(Regen: {timeToRegen})</span>
          )}
        </div>
        <div className="text-zinc-400">
          Due: {new Date(dueDate).toLocaleDateString()}
        </div>
      </div>
    </header>
  );
}
