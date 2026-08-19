import { Clock } from "lucide-react";
import type { StoredBehavioralSignals } from "@/lib/types/behavioral-signals";

interface BehaviorStatsGridProps {
  behavioralSignals: StoredBehavioralSignals;
}

export function BehaviorStatsGrid({
  behavioralSignals,
}: BehaviorStatsGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <StatTile
          label="Paste Events"
          value={`${behavioralSignals.pasteCount}`}
        />
        <StatTile
          label="Paste Chars"
          value={`${behavioralSignals.pasteLength}`}
        />
        <StatTile
          label="Keystrokes"
          value={`${behavioralSignals.keystrokeCount}`}
        />
        <StatTile label="Typing Speed" value={`${behavioralSignals.wpm} WPM`} />
        <StatTile
          label="Tab Switches"
          value={`${behavioralSignals.tabSwitchCount ?? 0}`}
        />
      </div>

      <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <h5 className="font-bold text-xs text-on-surface">
              Total Workspace Focus
            </h5>
            <p className="text-[10px] text-secondary mt-0.5">
              Sustained coding session length
            </p>
          </div>
        </div>
        <span className="text-sm font-extrabold text-on-surface">
          {Math.round(behavioralSignals.totalFocusTimeSecs / 60)} minute/s
        </span>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
      <p className="text-[10px] text-secondary font-bold uppercase tracking-wider mb-1">
        {label}
      </p>
      <span className="text-xl font-extrabold text-on-surface">{value}</span>
    </div>
  );
}
