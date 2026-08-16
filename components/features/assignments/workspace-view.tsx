"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { runCode } from "@/app/actions/run-code";
import { submitCode } from "@/app/actions/submit-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AssignmentData {
  id: string;
  title: string;
  instructions: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  heartsRegenMinutes: number;
  instructorEmail: string;
}

interface HeartsStateData {
  currentCount: number;
  lastRegenAt: string;
  totalSpent: number;
}

interface TestCaseData {
  id: string;
  input: string;
  expectedOutput: string;
}

interface SubmissionData {
  id: string;
  code: string;
  score: number;
  testResults: any;
  submittedAt: string;
}

interface WorkspaceViewProps {
  assignment: AssignmentData;
  initialHearts: HeartsStateData;
  visibleTestCases: TestCaseData[];
  initialSubmission: SubmissionData | null;
}

interface TestRunResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  stderr: string;
  compileOutput: string;
  status: { id: number; description: string };
  passed: boolean;
  visible?: boolean;
}

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  Python: "python",
  C: "c",
  JavaScript: "javascript",
  "C#": "csharp",
};

const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  Python: "# Write your Python code here\n# Input is read from stdin if applicable\n\nimport sys\n\ndef main():\n    # Read input from stdin\n    # lines = sys.stdin.read().splitlines()\n    print(\"Hello, World!\")\n\nif __name__ == \"__main__\":\n    main()\n",
  C: "// Write your C code here\n#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}\n",
  JavaScript: "// Write your JavaScript (Node.js) code here\nconst fs = require('fs');\n\nfunction main() {\n    // Read input from stdin if needed\n    // const input = fs.readFileSync(0, 'utf-8');\n    console.log(\"Hello, World!\");\n}\n\nmain();\n",
  "C#": "// Write your C# code here\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Hello, World!\");\n    }\n}\n",
};

export function WorkspaceView({
  assignment,
  initialHearts,
  visibleTestCases,
  initialSubmission,
}: WorkspaceViewProps) {
  const router = useRouter();
  const [code, setCode] = useState(
    initialSubmission?.code || DEFAULT_CODE_TEMPLATES[assignment.language] || ""
  );
  
  // Status states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionData | null>(initialSubmission);
  
  // Execution output states
  const [runResults, setRunResults] = useState<TestRunResult[] | null>(
    initialSubmission ? (initialSubmission.testResults as TestRunResult[]) : null
  );
  const [consoleOutput, setConsoleOutput] = useState<string>(
    initialSubmission
      ? `Assignment submitted.\nScore: ${initialSubmission.score}%`
      : ""
  );

  // Hearts state
  const [hearts, setHearts] = useState(initialHearts);

  // Behavioral Tracking Refs
  const trackingRef = useRef({
    pasteCount: 0,
    pasteLength: 0,
    keystrokeCount: 0,
    typingStartTime: 0,
    focusStartTime: 0,
    totalFocusTimeSecs: 0,
  });

  // Start editor focus tracking on load
  useEffect(() => {
    // If already submitted, no need to track typing metrics
    if (submission) return;

    trackingRef.current.focusStartTime = Date.now();
    
    const handleWindowFocus = () => {
      trackingRef.current.focusStartTime = Date.now();
    };

    const handleWindowBlur = () => {
      if (trackingRef.current.focusStartTime > 0) {
        const activeTime = (Date.now() - trackingRef.current.focusStartTime) / 1000;
        trackingRef.current.totalFocusTimeSecs += activeTime;
        trackingRef.current.focusStartTime = 0;
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
      if (trackingRef.current.focusStartTime > 0) {
        const activeTime = (Date.now() - trackingRef.current.focusStartTime) / 1000;
        trackingRef.current.totalFocusTimeSecs += activeTime;
      }
    };
  }, [submission]);

  // Track Monaco editor focus and paste events
  const handleEditorDidMount = (editor: any) => {
    if (submission) return;

    editor.onDidPaste((e: any) => {
      trackingRef.current.pasteCount += 1;
      const text = editor.getModel()?.getValueInRange(e.range) || "";
      trackingRef.current.pasteLength += text.length;
    });

    editor.onDidFocusEditorText(() => {
      trackingRef.current.focusStartTime = Date.now();
    });

    editor.onDidBlurEditorText(() => {
      if (trackingRef.current.focusStartTime > 0) {
        const activeTime = (Date.now() - trackingRef.current.focusStartTime) / 1000;
        trackingRef.current.totalFocusTimeSecs += activeTime;
        trackingRef.current.focusStartTime = 0;
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (submission) return;
    setCode(value || "");

    const now = Date.now();
    if (trackingRef.current.typingStartTime === 0) {
      trackingRef.current.typingStartTime = now;
    }
    trackingRef.current.keystrokeCount += 1;
  };

  const getWPM = () => {
    const { typingStartTime, keystrokeCount } = trackingRef.current;
    if (typingStartTime === 0 || keystrokeCount === 0) return 0;
    const durationMins = (Date.now() - typingStartTime) / 60000;
    if (durationMins <= 0) return 0;
    const wpm = (keystrokeCount / 5) / durationMins;
    return Math.round(wpm);
  };

  const handleRunCode = async () => {
    if (submission) return;

    setIsRunning(true);
    setRunResults(null);
    setConsoleOutput("");
    
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
          const passCount = response.results.filter((r: any) => r.passed).length;
          const totalCount = response.results.length;
          setConsoleOutput(`Execution complete.\nPassed ${passCount}/${totalCount} visible test cases.`);
          if (passCount === totalCount) {
            toast.success("All visible test cases passed!");
          } else {
            toast.warning(`Passed ${passCount}/${totalCount} test cases.`);
          }
        }
      } else {
        setConsoleOutput(`ERROR: ${response.error || "Execution failed"}`);
        toast.error(response.error || "Failed to execute code");
      }
    } catch (err) {
      setConsoleOutput("Connection failed. Please check your network.");
      toast.error("An unexpected error occurred during execution.");
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (submission) return;

    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your code? You can only submit once, and the editor will become read-only."
    );
    if (!confirmSubmit) return;

    setIsSubmitting(true);
    setRunResults(null);
    setConsoleOutput("");

    // Finalize focus time tracking
    if (trackingRef.current.focusStartTime > 0) {
      const activeTime = (Date.now() - trackingRef.current.focusStartTime) / 1000;
      trackingRef.current.totalFocusTimeSecs += activeTime;
      trackingRef.current.focusStartTime = 0;
    }

    const wpm = getWPM();
    const behavioralSignals = {
      pasteCount: trackingRef.current.pasteCount,
      pasteLength: trackingRef.current.pasteLength,
      keystrokeCount: trackingRef.current.keystrokeCount,
      wpm,
      totalFocusTimeSecs: Math.round(trackingRef.current.totalFocusTimeSecs),
    };

    try {
      const response = await submitCode(assignment.id, code, behavioralSignals);
      if (response.success && response.submission) {
        setSubmission(response.submission);
        setRunResults(response.submission.testResults as TestRunResult[]);
        setConsoleOutput(
          `SUBMISSION SUCCESSFUL!\nScore: ${response.submission.score}%\nSubmitted on: ${new Date(
            response.submission.submittedAt
          ).toLocaleString()}`
        );
        toast.success(`Code submitted! Final Score: ${response.submission.score}%`);
        router.refresh();
      } else {
        setConsoleOutput(`SUBMISSION ERROR: ${response.error || "Submit failed"}`);
        toast.error(response.error || "Failed to submit assignment");
      }
    } catch (err) {
      setConsoleOutput("Connection failed. Please check your network.");
      toast.error("An unexpected error occurred during submission.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "text-emerald-500 bg-emerald-950/20 border-emerald-800/50";
    if (score >= 70) return "text-amber-500 bg-amber-950/20 border-amber-800/50";
    return "text-rose-500 bg-rose-950/20 border-rose-800/50";
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header bar */}
      <header className="flex h-14 items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/student"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
          >
            &larr; Back to Dashboard
          </Link>
          <span className="text-zinc-600">|</span>
          <h1 className="text-sm font-bold tracking-tight">{assignment.title}</h1>
          <span className="bg-zinc-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
            {assignment.language}
          </span>
          {submission && (
            <span className="rounded-full bg-emerald-900/30 border border-emerald-800 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">
              Submitted
            </span>
          )}
        </div>
        
        {/* Hearts and Status */}
        <div className="flex items-center gap-4 text-sm font-semibold">
          <div className="flex items-center gap-1.5 text-rose-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="m11.645 20.91l-.007-.003c-.022-.012-.045-.025-.069-.04a22.066 22.066 0 0 1-2.036-1.423c-.76-.613-1.6-1.39-2.384-2.28C5.972 15.93 5 14.477 5 12.674c0-2.623 2.122-4.674 4.707-4.674c1.19 0 2.247.455 3.043 1.2c.796-.745 1.85-1.2 3.043-1.2c2.585 0 4.707 2.122 4.707 4.674c0 1.803-.972 3.256-2.148 4.293a22.063 22.063 0 0 1-2.453 1.86a4.268 4.268 0 0 1-.07.042l-.008.003l-.002.001c-.13.067-.32.067-.45 0z" />
            </svg>
            <span>{hearts.currentCount} Hearts</span>
          </div>
          <div className="text-xs text-zinc-400">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Instructions */}
        <div className="w-1/2 border-r border-zinc-800 bg-zinc-900/40 p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{assignment.title}</h2>
              <p className="text-xs text-zinc-500">Instructor: {assignment.instructorEmail}</p>
            </div>

            <div className="border-t border-zinc-800 pt-4 prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {assignment.instructions}
            </div>
          </div>

          {/* Submission Score Card */}
          {submission && (
            <div className={`p-4 rounded-lg border flex flex-col gap-2 mt-6 ${getScoreColorClass(submission.score)}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider">Submission Results</span>
                <span className="text-2xl font-extrabold">{submission.score}%</span>
              </div>
              <p className="text-[11px] opacity-80">
                You successfully completed this assignment. Your code has been frozen and cannot be edited.
              </p>
              <p className="text-[10px] opacity-60">
                Submitted on: {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Right Pane: Code Editor + Outputs */}
        <div className="w-1/2 flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* Editor Header */}
          <div className="flex h-11 items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
            <span className="text-xs font-semibold text-zinc-400">
              {submission ? "Freezed Source Code (Read-Only)" : "Workspace Editor"}
            </span>
            {!submission && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="bg-transparent border-zinc-700 hover:bg-zinc-800 hover:text-zinc-100"
                >
                  {isRunning ? "Running..." : "Run"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            )}
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[300px] border-b border-zinc-800">
            <Editor
              height="100%"
              language={MONACO_LANGUAGE_MAP[assignment.language]}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono, monospace)",
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                tabSize: 4,
                cursorBlinking: "smooth",
                readOnly: !!submission, // Make editor read-only if assignment is submitted
              }}
            />
          </div>

          {/* Output Panel / Console */}
          <div className="h-64 flex flex-col overflow-hidden bg-zinc-900/60 shrink-0">
            <div className="flex h-9 items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
              <span className="text-xs font-semibold text-zinc-400">
                {submission ? "Test Cases (Revealed)" : "Console & Test Cases"}
              </span>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Test Cases List */}
              <div className="w-1/2 border-r border-zinc-800 overflow-y-auto p-3 space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">
                  {submission ? "All Test Cases" : "Visible Test Cases"}
                </h4>
                {(!runResults || runResults.length === 0) ? (
                  <p className="text-xs text-zinc-500 italic">
                    {submission ? "No test results recorded." : "No test results yet. Click 'Run' to test your code."}
                  </p>
                ) : (
                  runResults.map((tc, index) => {
                    const isHidden = tc.visible === false;
                    return (
                      <div
                        key={tc.testCaseId || index}
                        className={`p-2.5 rounded border text-xs space-y-1.5 transition-colors ${
                          tc.passed
                            ? "bg-emerald-950/20 border-emerald-800/60 text-emerald-300"
                            : "bg-rose-950/20 border-rose-800/60 text-rose-300"
                        }`}
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span>Test Case #{index + 1}</span>
                            {isHidden && (
                              <span className="bg-purple-900/50 border border-purple-800 text-purple-300 text-[8px] font-bold px-1.5 rounded uppercase tracking-wide">
                                Hidden
                              </span>
                            )}
                          </div>
                          <span>{tc.passed ? "Passed" : "Failed"}</span>
                        </div>
                        {tc.input && (
                          <div className="text-[10px] font-mono text-zinc-500">
                            Input: <span className="text-zinc-350">{tc.input}</span>
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-zinc-500">
                          Expected: <span className="text-zinc-350">{tc.expectedOutput}</span>
                        </div>
                        {(!tc.passed) && (
                          <div className="text-[10px] font-mono text-rose-400/80">
                            Actual: <span className="text-rose-300 font-semibold">{tc.actualOutput.trim()}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Console Output */}
              <div className="w-1/2 overflow-y-auto p-4 bg-zinc-950/80 font-mono text-xs text-zinc-400 whitespace-pre-wrap select-text">
                {consoleOutput || "No execution logs yet. Click 'Run' or 'Submit' above."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
