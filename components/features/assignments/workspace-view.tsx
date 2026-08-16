"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { runCode } from "@/app/actions/run-code";
import { submitCode } from "@/app/actions/submit-code";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceInstructions } from "./workspace-instructions";
import { WorkspaceEditor } from "./workspace-editor";
import { WorkspaceChat } from "./workspace-chat";
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
  const [hearts, setHearts] = useState(initialHearts);
  const [timeToRegen, setTimeToRegen] = useState<string>("");
  const [chatInput, setChatInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    messages: initialChatMessages.map((msg) => ({ id: msg.id, role: msg.role, content: msg.content, parts: [{ type: "text" as const, text: msg.content }] })),
    onFinish: () => router.refresh(),
    onError: (err: Error) => { toast.error(err.message || "Failed to send message."); router.refresh(); },
  });
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (hearts.currentCount >= assignment.heartsCount) { setTimeToRegen(""); return; }
    const interval = setInterval(() => {
      const cooldownMs = assignment.heartsRegenMinutes * 60 * 1000;
      const nextRegen = new Date(hearts.lastRegenAt).getTime() + cooldownMs;
      const remainingMs = nextRegen - Date.now();
      if (remainingMs <= 0) {
        setHearts((prev) => ({ ...prev, currentCount: Math.min(assignment.heartsCount, prev.currentCount + 1), lastRegenAt: new Date().toISOString() }));
        router.refresh();
      } else {
        setTimeToRegen(`${Math.floor(remainingMs / 60000)}m ${Math.floor((remainingMs % 60000) / 1000)}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hearts, assignment, router]);

  const trackingRef = useRef({ pasteCount: 0, pasteLength: 0, keystrokeCount: 0, typingStartTime: 0, focusStartTime: Date.now(), totalFocusTimeSecs: 0 });

  useEffect(() => {
    if (submission) return;
    const onFocus = () => { trackingRef.current.focusStartTime = Date.now(); };
    const onBlur = () => { if (trackingRef.current.focusStartTime > 0) { trackingRef.current.totalFocusTimeSecs += (Date.now() - trackingRef.current.focusStartTime) / 1000; trackingRef.current.focusStartTime = 0; } };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("blur", onBlur); };
  }, [submission]);

  const handleEditorMount = (editor: any) => {
    if (submission) return;
    editor.onDidPaste((e: any) => { trackingRef.current.pasteCount += 1; trackingRef.current.pasteLength += (editor.getModel()?.getValueInRange(e.range) || "").length; });
  };

  const handleCodeChange = (value: string | undefined) => {
    if (submission) return;
    setCode(value || "");
    if (trackingRef.current.typingStartTime === 0) trackingRef.current.typingStartTime = Date.now();
    trackingRef.current.keystrokeCount += 1;
  };

  const handleRunCode = async () => {
    if (submission) return;
    setIsRunning(true); setRunResults(null); setConsoleOutput("");
    try {
      const response = await runCode(assignment.id, code);
      if (response.success && response.results) {
        setRunResults(response.results as TestRunResult[]);
        const compileErr = response.results.find((r: any) => r.compileOutput);
        const generalErr = response.results.find((r: any) => r.stderr);
        if (compileErr) { setConsoleOutput(`COMPILATION ERROR:\n${compileErr.compileOutput}`); toast.error("Compilation error!"); }
        else if (generalErr && response.results.every((r: any) => !r.passed)) { setConsoleOutput(`RUNTIME ERROR:\n${generalErr.stderr}`); toast.error("Runtime error!"); }
        else { const p = response.results.filter((r: any) => r.passed).length; setConsoleOutput(`Passed ${p}/${response.results.length} visible test cases.`); p === response.results.length ? toast.success("All visible test cases passed!") : toast.warning(`Passed ${p}/${response.results.length}`); }
      } else { setConsoleOutput(`ERROR: ${response.error}`); toast.error(response.error || "Failed to execute"); }
    } catch (err) { setConsoleOutput("Connection failed."); toast.error("Unexpected error."); console.error(err); }
    finally { setIsRunning(false); }
  };

  const handleSubmitCode = async () => {
    if (submission) return;
    if (!window.confirm("Submit your code? You can only submit once.")) return;
    setIsSubmitting(true); setRunResults(null); setConsoleOutput("");
    if (trackingRef.current.focusStartTime > 0) { trackingRef.current.totalFocusTimeSecs += (Date.now() - trackingRef.current.focusStartTime) / 1000; trackingRef.current.focusStartTime = 0; }
    const wpm = trackingRef.current.typingStartTime > 0 ? Math.round((trackingRef.current.keystrokeCount / 5) / ((Date.now() - trackingRef.current.typingStartTime) / 60000)) : 0;
    const signals = { pasteCount: trackingRef.current.pasteCount, pasteLength: trackingRef.current.pasteLength, keystrokeCount: trackingRef.current.keystrokeCount, wpm, totalFocusTimeSecs: Math.round(trackingRef.current.totalFocusTimeSecs) };
    try {
      const response = await submitCode(assignment.id, code, signals);
      if (response.success && response.submission) {
        setSubmission(response.submission); setRunResults(response.submission.testResults as TestRunResult[]);
        setConsoleOutput(`SUBMITTED! Score: ${response.submission.score}%`);
        toast.success(`Submitted! Score: ${response.submission.score}%`); router.refresh();
      } else { setConsoleOutput(`ERROR: ${response.error}`); toast.error(response.error || "Submit failed"); }
    } catch (err) { setConsoleOutput("Connection failed."); toast.error("Unexpected error."); console.error(err); }
    finally { setIsSubmitting(false); }
  };

  const onSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (submission) { toast.error("Chat is read-only."); return; }
    if (hearts.currentCount <= 0) { toast.error("0 hearts remaining."); return; }
    setHearts((prev) => ({ ...prev, currentCount: Math.max(0, prev.currentCount - 1), totalSpent: prev.totalSpent + 1, lastRegenAt: prev.currentCount === assignment.heartsCount ? new Date().toISOString() : prev.lastRegenAt }));
    sendMessage({ text: chatInput }, { body: { assignmentId: assignment.id, currentCode: code, lastRunResults: runResults } });
    setChatInput("");
  };

  const chatMsgs = messages.map((m: any) => ({ id: m.id, role: m.role, content: m.content }));

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <WorkspaceHeader title={assignment.title} language={assignment.language} dueDate={assignment.dueDate} heartsCount={hearts.currentCount} maxHearts={assignment.heartsCount} timeToRegen={timeToRegen} isSubmitted={!!submission} />
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceInstructions title={assignment.title} instructorEmail={assignment.instructorEmail} instructions={assignment.instructions} submission={submission} />
        <WorkspaceEditor language={assignment.language} code={code} isSubmitted={!!submission} isRunning={isRunning} isSubmitting={isSubmitting} runResults={runResults} consoleOutput={consoleOutput} onCodeChange={handleCodeChange} onEditorMount={handleEditorMount} onRun={handleRunCode} onSubmit={handleSubmitCode} />
        <WorkspaceChat messages={chatMsgs} isLoading={isLoading} isSubmitted={!!submission} heartsCount={hearts.currentCount} timeToRegen={timeToRegen} chatInput={chatInput} onChatInputChange={setChatInput} onSendMessage={onSendChatMessage} />
      </div>
    </div>
  );
}
