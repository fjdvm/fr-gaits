import { History } from "lucide-react";
import type { BehavioralEvent } from "@/lib/types/behavioral-signals";

interface EventTimelineProps {
  events: BehavioralEvent[];
}

function describeEvent(event: BehavioralEvent): string {
  switch (event.type) {
    case "paste":
      return `Paste (${event.length} chars)`;
    case "focus":
      return "Editor focused";
    case "blur":
      return "Editor unfocused";
    case "run_attempt":
      return `Run attempt (${event.passedCount}/${event.totalCount} passed)`;
    case "submit":
      return "Submitted";
  }
}

function formatRelativeTime(timestamp: number, startTimestamp: number): string {
  const seconds = Math.round((timestamp - startTimestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainderSecs = seconds % 60;
  return `${minutes}:${remainderSecs.toString().padStart(2, "0")}`;
}

export function EventTimeline({ events }: EventTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);
  const startTimestamp = sorted[0].timestamp;

  return (
    <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
      <div className="flex items-center gap-2.5 mb-3">
        <History className="h-5 w-5 text-primary" />
        <h5 className="font-bold text-xs text-on-surface">Event Timeline</h5>
      </div>
      <ol className="space-y-1.5">
        {sorted.map((event, index) => (
          <li key={index} className="flex items-center gap-3 text-xs">
            <span className="font-mono text-secondary w-10 shrink-0">{formatRelativeTime(event.timestamp, startTimestamp)}</span>
            <span className="text-on-surface font-semibold">{describeEvent(event)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
