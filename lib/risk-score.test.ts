import { describe, expect, it } from "vitest";
import { computeRiskScore } from "./risk-score";
import type { BehavioralEvent } from "./types/behavioral-signals";

describe("computeRiskScore", () => {
  it("scores a submission with no paste events as low risk with zero paste dominance", () => {
    const events: BehavioralEvent[] = [
      { type: "run_attempt", timestamp: 0, passedCount: 1, totalCount: 3 },
      { type: "run_attempt", timestamp: 60_000, passedCount: 2, totalCount: 3 },
      { type: "run_attempt", timestamp: 120_000, passedCount: 3, totalCount: 3 },
      { type: "submit", timestamp: 180_000 },
    ];

    const result = computeRiskScore(events, {
      finalCodeLength: 200,
      keystrokeCount: 200,
    });

    expect(result.components.pasteDominance).toBe(0);
    expect(result.flag).toBe("Low");
  });

  it("computes paste dominance as the largest paste's fraction of final code length", () => {
    const events: BehavioralEvent[] = [
      { type: "paste", timestamp: 0, length: 100, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 400_000 },
    ];

    const result = computeRiskScore(events, {
      finalCodeLength: 200,
      keystrokeCount: 200,
    });

    expect(result.components.pasteDominance).toBe(0.5);
  });

  it("caps paste dominance at 1.0 when the paste is longer than the final code", () => {
    const events: BehavioralEvent[] = [
      { type: "paste", timestamp: 0, length: 500, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 400_000 },
    ];

    const result = computeRiskScore(events, {
      finalCodeLength: 200,
      keystrokeCount: 0,
    });

    expect(result.components.pasteDominance).toBe(1);
  });

  it("scores proximity at 1.0 when submit happens within 30 seconds of the last paste", () => {
    const events: BehavioralEvent[] = [
      { type: "paste", timestamp: 0, length: 50, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 20_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.proximityScore).toBe(1);
  });

  it("decays proximity score linearly to 0 by 5 minutes after the last paste", () => {
    const events: BehavioralEvent[] = [
      { type: "paste", timestamp: 0, length: 50, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 30_000 + (5 * 60_000 - 30_000) / 2 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.proximityScore).toBeCloseTo(0.5, 5);
  });

  it("scores proximity at 0 when submit happens 5+ minutes after the last paste", () => {
    const events: BehavioralEvent[] = [
      { type: "paste", timestamp: 0, length: 50, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 6 * 60_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.proximityScore).toBe(0);
  });

  it("scores proximity at 0 when there is no paste event at all", () => {
    const events: BehavioralEvent[] = [{ type: "submit", timestamp: 1000 }];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.proximityScore).toBe(0);
  });

  it("scores idle-to-paste at 1.0 when a paste follows a gap greater than 2 minutes", () => {
    const events: BehavioralEvent[] = [
      { type: "run_attempt", timestamp: 0, passedCount: 0, totalCount: 3 },
      { type: "paste", timestamp: 3 * 60_000, length: 50, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 3 * 60_000 + 10_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.idleToPasteScore).toBe(1);
  });

  it("scores idle-to-paste at 0 when the paste follows less than a 2 minute gap", () => {
    const events: BehavioralEvent[] = [
      { type: "run_attempt", timestamp: 0, passedCount: 0, totalCount: 3 },
      { type: "paste", timestamp: 60_000, length: 50, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 70_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.idleToPasteScore).toBe(0);
  });

  it("scores idle-to-paste at 0 when there is no paste event", () => {
    const events: BehavioralEvent[] = [{ type: "submit", timestamp: 1000 }];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.idleToPasteScore).toBe(0);
  });

  it("computes keystroke ratio as keystrokes divided by expected keystrokes (code length / 5)", () => {
    const events: BehavioralEvent[] = [{ type: "submit", timestamp: 1000 }];

    // finalCodeLength 200 -> expected keystrokes = 40; actual keystrokes = 20 -> ratio 0.5
    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 20 });

    expect(result.components.keystrokeRatio).toBe(0.5);
  });

  it("caps keystroke ratio at 1.0 when keystrokes exceed expected keystrokes", () => {
    const events: BehavioralEvent[] = [{ type: "submit", timestamp: 1000 }];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 1000 });

    expect(result.components.keystrokeRatio).toBe(1);
  });

  it("treats keystroke ratio as 0 when the final code is empty", () => {
    const events: BehavioralEvent[] = [{ type: "submit", timestamp: 1000 }];

    const result = computeRiskScore(events, { finalCodeLength: 0, keystrokeCount: 0 });

    expect(result.components.keystrokeRatio).toBe(0);
  });

  it("scores low-effort-run at 1.0 when fewer than 2 run attempts precede the dominant paste", () => {
    const events: BehavioralEvent[] = [
      { type: "run_attempt", timestamp: 0, passedCount: 0, totalCount: 3 },
      { type: "paste", timestamp: 10_000, length: 180, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 20_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.lowEffortRunScore).toBe(1);
  });

  it("scores low-effort-run at 0 when 2 or more run attempts precede the dominant paste", () => {
    const events: BehavioralEvent[] = [
      { type: "run_attempt", timestamp: 0, passedCount: 0, totalCount: 3 },
      { type: "run_attempt", timestamp: 5_000, passedCount: 1, totalCount: 3 },
      { type: "paste", timestamp: 10_000, length: 180, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 20_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.lowEffortRunScore).toBe(0);
  });

  it("scores low-effort-run at 0 when there is no paste event", () => {
    const events: BehavioralEvent[] = [{ type: "submit", timestamp: 1000 }];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.components.lowEffortRunScore).toBe(0);
  });

  it("computes the total as the weighted sum of all five components", () => {
    // pasteDominance=1 (35), proximity=1 (20), idleToPaste=1 (20), keystrokeRatio=0 -> (1-0)*15=15, lowEffortRun=1 (10)
    // total = 35 + 20 + 20 + 15 + 10 = 100
    const events: BehavioralEvent[] = [
      { type: "run_attempt", timestamp: 0, passedCount: 0, totalCount: 1 },
      { type: "paste", timestamp: 3 * 60_000, length: 200, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 3 * 60_000 + 10_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.total).toBe(100);
  });

  it("flags High when the total risk score is 60 or above", () => {
    const events: BehavioralEvent[] = [
      { type: "paste", timestamp: 3 * 60_000, length: 200, charsAtTimeOfPaste: 0 },
      { type: "submit", timestamp: 3 * 60_000 + 10_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 0 });

    expect(result.flag).toBe("High");
  });

  it("flags Medium when the total risk score is between 30 and 59", () => {
    // pasteDominance=0.5 (17.5), proximity=1 (20), rest 0 -> total ~37.5
    const events: BehavioralEvent[] = [
      { type: "paste", timestamp: 0, length: 100, charsAtTimeOfPaste: 0 },
      { type: "run_attempt", timestamp: 5_000, passedCount: 1, totalCount: 1 },
      { type: "run_attempt", timestamp: 6_000, passedCount: 1, totalCount: 1 },
      { type: "submit", timestamp: 20_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 40 });

    expect(result.flag).toBe("Medium");
  });

  it("flags Low when the total risk score is below 30", () => {
    const events: BehavioralEvent[] = [
      { type: "run_attempt", timestamp: 0, passedCount: 1, totalCount: 1 },
      { type: "run_attempt", timestamp: 60_000, passedCount: 1, totalCount: 1 },
      { type: "submit", timestamp: 120_000 },
    ];

    const result = computeRiskScore(events, { finalCodeLength: 200, keystrokeCount: 200 });

    expect(result.flag).toBe("Low");
  });
});
