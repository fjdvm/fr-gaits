import { ShieldAlert } from "lucide-react";
import type { StoredBehavioralSignals } from "@/lib/types/behavioral-signals";

interface RiskFlagCardProps {
  riskScore: NonNullable<StoredBehavioralSignals["riskScore"]>;
}

const FLAG_STYLES: Record<string, string> = {
  Low: "bg-green-100 text-green-800 border-green-300",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  High: "bg-red-100 text-red-800 border-red-300",
};

const COMPONENT_LABELS: Record<keyof RiskFlagCardProps["riskScore"]["components"], string> = {
  pasteDominance: "Paste Dominance",
  proximityScore: "Paste-to-Submit Proximity",
  idleToPasteScore: "Idle-to-Paste Pattern",
  keystrokeRatio: "Keystroke Ratio",
  lowEffortRunScore: "Low-Effort Run Attempts",
};

export function RiskFlagCard({ riskScore }: RiskFlagCardProps) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <div>
            <h5 className="font-bold text-xs text-on-surface">Behavioral Risk</h5>
            <p className="text-[10px] text-secondary mt-0.5">Heuristic report for instructor review — not a verdict</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full border text-xs font-bold ${FLAG_STYLES[riskScore.flag]}`}>
          {riskScore.flag} ({Math.round(riskScore.total)})
        </span>
      </div>

      <div className="space-y-2">
        {Object.entries(riskScore.components).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-secondary font-semibold">{COMPONENT_LABELS[key as keyof typeof COMPONENT_LABELS]}</span>
            <span className="font-bold text-on-surface">{Math.round(value * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
