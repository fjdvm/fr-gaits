import type { BehavioralEvent } from "./types/behavioral-signals";

export type RiskFlag = "Low" | "Medium" | "High";

export interface RiskScoreComponents {
  pasteDominance: number;
  proximityScore: number;
  idleToPasteScore: number;
  keystrokeRatio: number;
  lowEffortRunScore: number;
}

export interface RiskScoreResult {
  total: number;
  flag: RiskFlag;
  components: RiskScoreComponents;
}

export interface RiskScoreInput {
  finalCodeLength: number;
  keystrokeCount: number;
}

export function computeRiskScore(events: BehavioralEvent[], input: RiskScoreInput): RiskScoreResult {
  const pasteEvents = events.filter((e): e is Extract<BehavioralEvent, { type: "paste" }> => e.type === "paste");
  const submitEvent = events.find((e): e is Extract<BehavioralEvent, { type: "submit" }> => e.type === "submit");
  const largestPasteLength = pasteEvents.reduce((max, e) => Math.max(max, e.length), 0);
  const pasteDominance = input.finalCodeLength > 0
    ? Math.min(1, largestPasteLength / input.finalCodeLength)
    : 0;

  const proximityScore = computeProximityScore(pasteEvents, submitEvent);
  const idleToPasteScore = computeIdleToPasteScore(events, pasteEvents);
  const keystrokeRatio = computeKeystrokeRatio(input.keystrokeCount, input.finalCodeLength);
  const lowEffortRunScore = computeLowEffortRunScore(events, pasteEvents);

  const components: RiskScoreComponents = {
    pasteDominance,
    proximityScore,
    idleToPasteScore,
    keystrokeRatio,
    lowEffortRunScore,
  };

  const total = computeTotal(components);
  const flag = computeFlag(total);

  return { total, flag, components };
}

const HIGH_RISK_THRESHOLD = 60;
const MEDIUM_RISK_THRESHOLD = 30;

function computeTotal(components: RiskScoreComponents): number {
  return (
    35 * components.pasteDominance +
    20 * components.proximityScore +
    20 * components.idleToPasteScore +
    15 * (1 - components.keystrokeRatio) +
    10 * components.lowEffortRunScore
  );
}

function computeFlag(total: number): RiskFlag {
  if (total >= HIGH_RISK_THRESHOLD) return "High";
  if (total >= MEDIUM_RISK_THRESHOLD) return "Medium";
  return "Low";
}

const PROXIMITY_FULL_SCORE_WINDOW_MS = 30_000;
const PROXIMITY_DECAY_END_MS = 5 * 60_000;
const IDLE_GAP_THRESHOLD_MS = 2 * 60_000;

function computeProximityScore(
  pasteEvents: Extract<BehavioralEvent, { type: "paste" }>[],
  submitEvent: Extract<BehavioralEvent, { type: "submit" }> | undefined
): number {
  if (!submitEvent || pasteEvents.length === 0) return 0;

  const lastPasteTimestamp = pasteEvents.reduce((latest, e) => Math.max(latest, e.timestamp), -Infinity);
  const delta = submitEvent.timestamp - lastPasteTimestamp;

  if (delta <= PROXIMITY_FULL_SCORE_WINDOW_MS) return 1;
  if (delta >= PROXIMITY_DECAY_END_MS) return 0;

  const decayRange = PROXIMITY_DECAY_END_MS - PROXIMITY_FULL_SCORE_WINDOW_MS;
  return 1 - (delta - PROXIMITY_FULL_SCORE_WINDOW_MS) / decayRange;
}

function computeIdleToPasteScore(
  events: BehavioralEvent[],
  pasteEvents: Extract<BehavioralEvent, { type: "paste" }>[]
): number {
  if (pasteEvents.length === 0) return 0;

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);

  for (const pasteEvent of pasteEvents) {
    const index = sorted.findIndex((e) => e === pasteEvent);
    const previousEvent = index > 0 ? sorted[index - 1] : undefined;
    if (!previousEvent) continue;

    const gap = pasteEvent.timestamp - previousEvent.timestamp;
    if (gap > IDLE_GAP_THRESHOLD_MS) return 1;
  }

  return 0;
}

const AVG_CHARS_PER_KEYSTROKE = 5;

function computeKeystrokeRatio(keystrokeCount: number, finalCodeLength: number): number {
  if (finalCodeLength <= 0) return 0;
  const expectedKeystrokes = finalCodeLength / AVG_CHARS_PER_KEYSTROKE;
  if (expectedKeystrokes <= 0) return 0;
  return Math.min(1, keystrokeCount / expectedKeystrokes);
}

const LOW_EFFORT_RUN_THRESHOLD = 2;

function computeLowEffortRunScore(
  events: BehavioralEvent[],
  pasteEvents: Extract<BehavioralEvent, { type: "paste" }>[]
): number {
  if (pasteEvents.length === 0) return 0;

  const dominantPaste = pasteEvents.reduce((max, e) => (e.length > max.length ? e : max));
  const runAttemptsBeforeDominantPaste = events.filter(
    (e): e is Extract<BehavioralEvent, { type: "run_attempt" }> =>
      e.type === "run_attempt" && e.timestamp < dominantPaste.timestamp
  ).length;

  return runAttemptsBeforeDominantPaste < LOW_EFFORT_RUN_THRESHOLD ? 1 : 0;
}
