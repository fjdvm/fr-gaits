"use client";

import { useCallback, useEffect, useRef } from "react";
import type { OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import type { BehavioralSignals } from "@/lib/types/behavioral-signals";

export type { BehavioralSignals };

export function useBehavioralTracking(disabled: boolean) {
  const trackingRef = useRef({
    pasteCount: 0,
    pasteLength: 0,
    keystrokeCount: 0,
    typingStartTime: 0,
    focusStartTime: 0,
    totalFocusTimeSecs: 0,
  });

  useEffect(() => {
    trackingRef.current.focusStartTime = Date.now();
  }, []);

  useEffect(() => {
    if (disabled) return;
    const onFocus = () => { trackingRef.current.focusStartTime = Date.now(); };
    const onBlur = () => {
      if (trackingRef.current.focusStartTime > 0) {
        trackingRef.current.totalFocusTimeSecs += (Date.now() - trackingRef.current.focusStartTime) / 1000;
        trackingRef.current.focusStartTime = 0;
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("blur", onBlur); };
  }, [disabled]);

  const handleEditorMount: OnMount = useCallback((editor) => {
    if (disabled) return;
    editor.onDidPaste((e: MonacoEditorNS.IPasteEvent) => {
      trackingRef.current.pasteCount += 1;
      trackingRef.current.pasteLength += (editor.getModel()?.getValueInRange(e.range) || "").length;
    });
  }, [disabled]);

  const recordKeystroke = useCallback(() => {
    if (trackingRef.current.typingStartTime === 0) trackingRef.current.typingStartTime = Date.now();
    trackingRef.current.keystrokeCount += 1;
  }, []);

  const collectSignals = useCallback((): BehavioralSignals => {
    if (trackingRef.current.focusStartTime > 0) {
      trackingRef.current.totalFocusTimeSecs += (Date.now() - trackingRef.current.focusStartTime) / 1000;
      trackingRef.current.focusStartTime = 0;
    }
    const wpm = trackingRef.current.typingStartTime > 0
      ? Math.round((trackingRef.current.keystrokeCount / 5) / ((Date.now() - trackingRef.current.typingStartTime) / 60000))
      : 0;
    return {
      pasteCount: trackingRef.current.pasteCount,
      pasteLength: trackingRef.current.pasteLength,
      keystrokeCount: trackingRef.current.keystrokeCount,
      wpm,
      totalFocusTimeSecs: Math.round(trackingRef.current.totalFocusTimeSecs),
    };
  }, []);

  return { handleEditorMount, recordKeystroke, collectSignals };
}
