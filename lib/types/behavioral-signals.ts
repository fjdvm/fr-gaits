export interface BehavioralSignals {
  pasteCount: number;
  pasteLength: number;
  keystrokeCount: number;
  wpm: number;
  totalFocusTimeSecs: number;
  events: BehavioralEvent[];
}

export type BehavioralEvent =
  | { type: "paste"; timestamp: number; length: number; charsAtTimeOfPaste: number }
  | { type: "focus"; timestamp: number }
  | { type: "blur"; timestamp: number }
  | { type: "run_attempt"; timestamp: number; passedCount: number; totalCount: number }
  | { type: "submit"; timestamp: number };

export interface StoredBehavioralSignals extends Omit<BehavioralSignals, "events"> {
  events?: BehavioralEvent[];
  riskScore?: {
    total: number;
    flag: "Low" | "Medium" | "High";
    components: {
      pasteDominance: number;
      proximityScore: number;
      idleToPasteScore: number;
      keystrokeRatio: number;
      lowEffortRunScore: number;
    };
  };
}

