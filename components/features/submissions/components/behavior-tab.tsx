import { Sparkles, Clock } from "lucide-react";
import type { BehavioralSignals } from "@/lib/types/behavioral-signals";

interface BehaviorTabProps {
  behavioralSignals: BehavioralSignals;
}

export function BehaviorTab({ behavioralSignals }: BehaviorTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-5 flex items-start gap-4">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-on-surface">Typing & Copy Profile</h4>
          <p className="text-xs text-secondary mt-1">Behavioral signals recorded from student workspace activities.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">Paste Events</p>
          <span className="text-2xl font-extrabold text-on-surface">{behavioralSignals.pasteCount}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">Paste Chars</p>
          <span className="text-2xl font-extrabold text-on-surface">{behavioralSignals.pasteLength}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">Keystrokes</p>
          <span className="text-2xl font-extrabold text-on-surface">{behavioralSignals.keystrokeCount}</span>
        </div>
        <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
          <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">Typing Speed</p>
          <span className="text-2xl font-extrabold text-on-surface">
            {behavioralSignals.wpm} <span className="text-xs text-secondary font-bold">WPM</span>
          </span>
        </div>
      </div>

      <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <h5 className="font-bold text-xs text-on-surface">Total Workspace Focus</h5>
            <p className="text-[10px] text-secondary mt-0.5">Sustained coding session length</p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-on-surface">
          {Math.round(behavioralSignals.totalFocusTimeSecs / 60)} minutes
        </span>
      </div>
    </div>
  );
}
