"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { runCode } from "@/app/actions/run-code";
import { submitCode } from "@/app/actions/submit-code";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceInstructions } from "./workspace-instructions";
import { WorkspaceEditor } from "./workspace-editor";
import { WorkspaceChat } from "./workspace-chat";
import { useHeartsTimer } from "./use-hearts-timer";
import { DEFAULT_CODE_TEMPLATES } from "./code-templates";
import type { WorkspaceViewProps, TestRunResult, SubmissionData } from "./types";

export function WorkspaceView({ assignment, initialHearts, visibleTestCases, initialSubmission, initialChatMessages }: WorkspaceViewProps) {
  const router = useRouter();
  const [code, setCode] = useState(initialSubmission?.code || DEFAULT_CODE_TEMPLATES[assignment.language] || "");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionData | null>(initialSubmission);
  const [runResults, setRunResults] = useState<TestRunResult[] | null>(initialSubmission ? (initialSubmission.testResults as TestRunResult[]) : null);
  const [consoleOutput, setConsoleOutput] = useState<string>(initialSubmission ? `Assignment submitted.\nScore: ${initialSubmission.score}%` : "");
  const [chatInput, setChatInput] = useState("");

  const { hearts, timeToRegen, spendHeart } = useHeartsTimer({
    initialHearts,
    maxHearts: assignment.heartsCount,
    regenMinutes: assignment.heartsRegenMinutes,
  });

  const { messages, sendMessage, status } = useChat({
    messages: initialChatMessages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      parts: [{ type: "text" as const, text: msg.content }],
    })),
    onError: (err: Error) => {
      toast.error(err.message || "Failed to send message.");
    },
  });
  const isLoading = status === "submitted" || status === "streaming";

  const trackingRef = useRef({ pasteCount: 0, pasteLength: 0, keystrokeCount: 0, typingStartTime: 0, focusStartTime: Date.now(), totalFocusTimeSecs: 0 });

  useEffect(() => {
    if (submission) return;
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
  }, [submission]);

  const handleEditorMount = useCallback((editor: any) => {
    if (submission) return;
    editor.onDidPaste((e: any) => {
      trackingRef.current.pasteCount += 1;
      trackingRef.current.pasteLength += (editor.getModel()?.getValueInRange(e.range) || "").length;
    });
  }, [submission]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (submission) return;
    setCode(value || "");
    if (trackingRef.current.typingStartTime === 0) trackingRef.current.typingStartTime = Date.now();
    trackingRef.current.keystrokeCount += 1;
  }, [submission]);

  const handleRunCode = async () => {
    if (submission) return;
    setIsRunning(true); setRunResults(null); setConsoleOutput("");
    try {
      const response = await runCode(assignment.id, code);
      if (response.success && response.results) {
        setRunResults(response.results as TestRunResult[]);
        const compileErr = response.results.find((r: any) => r.compileOutput);
        const generalErr = response.results.find((r: any) => r.stderr);
        if (compileErr) {
          setConsoleOutput(`COMPILATION ERROR:\n${compileErr.compileOutput}`);
          toast.error("Compilation error!");
        } else if (generalErr && response.results.every((r: any) => !r.passed)) {
          setConsoleOutput(`RUNTIME ERROR:\n${generalErr.stderr}`);
          toast.error("Runtime error!");
        } else {
          const p = response.results.filter((r: any) => r.passed).length;
          setConsoleOutput(`Passed ${p}/${response.results.length} visible test cases.`);
          p === response.results.length ? toast.success("All visible test cases passed!") : toast.warning(`Passed ${p}/${response.results.length}`);
        }
      } else {
        setConsoleOutput(`ERROR: ${response.error}`);
        toast.error(response.error || "Failed to execute");
      }
    } catch (err) {
      setConsoleOutput("Connection failed.");
      toast.error("Unexpected error.");
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (submission) return;
    if (!window.confirm("Submit your code? You can only submit once.")) return;
    setIsSubmitting(true); setRunResults(null); setConsoleOutput("");
    if (trackingRef.current.focusStartTime > 0) {
      trackingRef.current.totalFocusTimeSecs += (Date.now() - trackingRef.current.focusStartTime) / 1000;
      trackingRef.current.focusStartTime = 0;
    }
    const wpm = trackingRef.current.typingStartTime > 0
      ? Math.round((trackingRef.current.keystrokeCount / 5) / ((Date.now() - trackingRef.current.typingStartTime) / 60000))
      : 0;
    const signals = {
      pasteCount: trackingRef.current.pasteCount,
      pasteLength: trackingRef.current.pasteLength,
      keystrokeCount: trackingRef.current.keystrokeCount,
      wpm,
      totalFocusTimeSecs: Math.round(trackingRef.current.totalFocusTimeSecs),
    };
    try {
      const response = await submitCode(assignment.id, code, signals);
      if (response.success && response.submission) {
        setSubmission(response.submission);
        setRunResults(response.submission.testResults as TestRunResult[]);
        setConsoleOutput(`SUBMITTED! Score: ${response.submission.score}%`);
        toast.success(`Submitted! Score: ${response.submission.score}%`);
        router.refresh();
      } else {
        setConsoleOutput(`ERROR: ${response.error}`);
        toast.error(response.error || "Submit failed");
      }
    } catch (err) {
      setConsoleOutput("Connection failed.");
      toast.error("Unexpected error.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const codeRef = useRef(code);
  codeRef.current = code;
  const runResultsRef = useRef(runResults);
  runResultsRef.current = runResults;

  const onSendChatMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (submission) { toast.error("Chat is read-only."); return; }
    if (hearts.currentCount <= 0) { toast.error("0 hearts remaining."); return; }
    spendHeart(hearts.currentCount === assignment.heartsCount);
    sendMessage({ text: chatInput }, { body: { assignmentId: assignment.id, currentCode: codeRef.current, lastRunResults: runResultsRef.current } });
    setChatInput("");
  }, [chatInput, submission, hearts.currentCount, assignment.heartsCount, assignment.id, spendHeart, sendMessage]);

  const chatMsgs = useMemo(() =>
    messages.map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.parts?.filter((p: any) => p.type === "text").map((p: any) => p.text).join("") || m.content || "",
    })),
    [messages]
  );

  return (
    <div className="flex flex-col h-screen bg-surface-container-low text-on-surface overflow-hidden">
      <WorkspaceHeader title={assignment.title} language={assignment.language} dueDate={assignment.dueDate} heartsCount={hearts.currentCount} maxHearts={assignment.heartsCount} timeToRegen={timeToRegen} isSubmitted={!!submission} />
      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        <WorkspaceInstructions title={assignment.title} instructorEmail={assignment.instructorEmail} instructions={assignment.instructions} submission={submission} />
        <WorkspaceEditor language={assignment.language} code={code} isSubmitted={!!submission} isRunning={isRunning} isSubmitting={isSubmitting} runResults={runResults} consoleOutput={consoleOutput} onCodeChange={handleCodeChange} onEditorMount={handleEditorMount} onRun={handleRunCode} onSubmit={handleSubmitCode} />
        <WorkspaceChat messages={chatMsgs} isLoading={isLoading} isSubmitted={!!submission} heartsCount={hearts.currentCount} timeToRegen={timeToRegen} chatInput={chatInput} onChatInputChange={setChatInput} onSendMessage={onSendChatMessage} />
      </div>
    </div>
  );
}
