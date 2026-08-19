"use client";

import { useCallback, useEffect, useRef } from "react";
import type { OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import type { BehavioralSignals, BehavioralEvent } from "@/lib/types/behavioral-signals";

export type { BehavioralSignals };

export function useBehavioralTracking(disabled: boolean) {
  const trackingRef = useRef({
    pasteCount: 0,
    pasteLength: 0,
    keystrokeCount: 0,
    typingStartTime: 0,
    focusStartTime: 0,
    totalFocusTimeSecs: 0,
    events: [] as BehavioralEvent[],
  });

  useEffect(() => {
    trackingRef.current.focusStartTime = Date.now();
  }, []);

  useEffect(() => {
    if (disabled) return;
    const onFocus = () => {
      trackingRef.current.focusStartTime = Date.now();
      trackingRef.current.events.push({ type: "focus", timestamp: Date.now() });
    };
    const onBlur = () => {
      if (trackingRef.current.focusStartTime > 0) {
        trackingRef.current.totalFocusTimeSecs += (Date.now() - trackingRef.current.focusStartTime) / 1000;
        trackingRef.current.focusStartTime = 0;
      }
      trackingRef.current.events.push({ type: "blur", timestamp: Date.now() });
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("blur", onBlur); };
  }, [disabled]);

  const handleEditorMount: OnMount = useCallback((editor) => {
    if (disabled) return;
    editor.onDidPaste((e: MonacoEditorNS.IPasteEvent) => {
      const pasteLength = (editor.getModel()?.getValueInRange(e.range) || "").length;
      const charsAtTimeOfPaste = (editor.getModel()?.getValueLength() || 0) - pasteLength;
      trackingRef.current.pasteCount += 1;
      trackingRef.current.pasteLength += pasteLength;
      trackingRef.current.events.push({
        type: "paste",
        timestamp: Date.now(),
        length: pasteLength,
        charsAtTimeOfPaste: Math.max(0, charsAtTimeOfPaste),
      });
    });
  }, [disabled]);

  const recordKeystroke = useCallback(() => {
    if (trackingRef.current.typingStartTime === 0) trackingRef.current.typingStartTime = Date.now();
    trackingRef.current.keystrokeCount += 1;
  }, []);

  const recordRunAttempt = useCallback((passedCount: number, totalCount: number) => {
    trackingRef.current.events.push({
      type: "run_attempt",
      timestamp: Date.now(),
      passedCount,
      totalCount,
    });
  }, []);

  const collectSignals = useCallback((): BehavioralSignals => {
    if (trackingRef.current.focusStartTime > 0) {
      trackingRef.current.totalFocusTimeSecs += (Date.now() - trackingRef.current.focusStartTime) / 1000;
      trackingRef.current.focusStartTime = 0;
    }
    const wpm = trackingRef.current.typingStartTime > 0
      ? Math.round((trackingRef.current.keystrokeCount / 5) / ((Date.now() - trackingRef.current.typingStartTime) / 60000))
      : 0;
    trackingRef.current.events.push({ type: "submit", timestamp: Date.now() });
    return {
      pasteCount: trackingRef.current.pasteCount,
      pasteLength: trackingRef.current.pasteLength,
      keystrokeCount: trackingRef.current.keystrokeCount,
      wpm,
      totalFocusTimeSecs: Math.round(trackingRef.current.totalFocusTimeSecs),
      events: trackingRef.current.events,
    };
  }, []);

  return { handleEditorMount, recordKeystroke, recordRunAttempt, collectSignals };
}
