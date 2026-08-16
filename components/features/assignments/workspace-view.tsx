"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { runCode } from "@/app/actions/run-code";
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
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<TestRunResult[] | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string>("");

  // Hearts state (local representation, to be linked with regen logic in next tickets)
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
    trackingRef.current.focusStartTime = Date.now();
    
    // Set up window blur/focus event handlers
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
      // Accumulate final time on unmount
      if (trackingRef.current.focusStartTime > 0) {
        const activeTime = (Date.now() - trackingRef.current.focusStartTime) / 1000;
        trackingRef.current.totalFocusTimeSecs += activeTime;
      }
    };
  }, []);

  // Track Monaco editor focus
  const handleEditorDidMount = (editor: any) => {
    // Monitor paste events in the editor
    editor.onDidPaste((e: any) => {
      trackingRef.current.pasteCount += 1;
      const text = editor.getModel()?.getValueInRange(e.range) || "";
      trackingRef.current.pasteLength += text.length;
    });

    // Monitor editor focus/blur
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
    setCode(value || "");

    // Track keystroke counts and typing speed
    const now = Date.now();
    if (trackingRef.current.typingStartTime === 0) {
      trackingRef.current.typingStartTime = now;
    }
    trackingRef.current.keystrokeCount += 1;
  };

  // Approximates WPM based on keystrokes and typing duration
  const getWPM = () => {
    const { typingStartTime, keystrokeCount } = trackingRef.current;
    if (typingStartTime === 0 || keystrokeCount === 0) return 0;
    const durationMins = (Date.now() - typingStartTime) / 60000;
    if (durationMins <= 0) return 0;
    // Standard WPM: 5 characters per word
    const wpm = (keystrokeCount / 5) / durationMins;
    return Math.round(wpm);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setRunResults(null);
    setConsoleOutput("");
    
    try {
      const response = await runCode(assignment.id, code);
      if (response.success && response.results) {
        setRunResults(response.results as TestRunResult[]);
        
        // Log compilation errors or general stderr to console output if any test case has them
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
        <div className="w-1/2 border-r border-zinc-800 bg-zinc-900/40 p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{assignment.title}</h2>
            <p className="text-xs text-zinc-500">Instructor: {assignment.instructorEmail}</p>
          </div>

          <div className="border-t border-zinc-800 pt-4 prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {assignment.instructions}
          </div>
        </div>

        {/* Right Pane: Code Editor + Outputs */}
        <div className="w-1/2 flex flex-col h-full overflow-hidden bg-zinc-950">
          {/* Editor Header */}
          <div className="flex h-11 items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
            <span className="text-xs font-semibold text-zinc-400">Workspace Editor</span>
            <Button
              size="sm"
              onClick={handleRunCode}
              disabled={isRunning}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isRunning ? "Running..." : "Run Code"}
            </Button>
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
              }}
            />
          </div>

          {/* Output Panel / Console */}
          <div className="h-64 flex flex-col overflow-hidden bg-zinc-900/60 shrink-0">
            <div className="flex h-9 items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
              <span className="text-xs font-semibold text-zinc-400">Console & Test Cases</span>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Test Cases List */}
              <div className="w-1/2 border-r border-zinc-800 overflow-y-auto p-3 space-y-2">
                <h4 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Visible Test Cases</h4>
                {visibleTestCases.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No visible test cases for this assignment.</p>
                ) : (
                  visibleTestCases.map((tc, index) => {
                    const result = runResults?.find((r) => r.testCaseId === tc.id);
                    return (
                      <div
                        key={tc.id}
                        className={`p-2.5 rounded border text-xs space-y-1.5 transition-colors ${
                          result
                            ? result.passed
                              ? "bg-emerald-950/20 border-emerald-800/60 text-emerald-300"
                              : "bg-rose-950/20 border-rose-800/60 text-rose-300"
                            : "bg-zinc-900/40 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <div className="flex justify-between items-center font-semibold">
                          <span>Test Case #{index + 1}</span>
                          {result ? (
                            <span>{result.passed ? "Passed" : "Failed"}</span>
                          ) : (
                            <span className="text-[10px] text-zinc-500">Not Run</span>
                          )}
                        </div>
                        {tc.input && (
                          <div className="text-[10px] font-mono text-zinc-500">
                            Input: <span className="text-zinc-350">{tc.input}</span>
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-zinc-500">
                          Expected: <span className="text-zinc-350">{tc.expectedOutput}</span>
                        </div>
                        {result && !result.passed && (
                          <div className="text-[10px] font-mono text-rose-400/80">
                            Actual: <span className="text-rose-300 font-semibold">{result.actualOutput.trim()}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Console Output */}
              <div className="w-1/2 overflow-y-auto p-4 bg-zinc-950/80 font-mono text-xs text-zinc-400 whitespace-pre-wrap select-text">
                {consoleOutput || "No execution logs yet. Click 'Run Code' above."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
