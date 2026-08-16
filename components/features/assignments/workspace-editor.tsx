"use client";

import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

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

interface WorkspaceEditorProps {
  language: string;
  code: string;
  isSubmitted: boolean;
  isRunning: boolean;
  isSubmitting: boolean;
  runResults: TestRunResult[] | null;
  consoleOutput: string;
  onCodeChange: (value: string | undefined) => void;
  onEditorMount: (editor: any) => void;
  onRun: () => void;
  onSubmit: () => void;
}

export function WorkspaceEditor({
  language,
  code,
  isSubmitted,
  isRunning,
  isSubmitting,
  runResults,
  consoleOutput,
  onCodeChange,
  onEditorMount,
  onRun,
  onSubmit,
}: WorkspaceEditorProps) {
  return (
    <div className="w-[42%] flex flex-col h-full overflow-hidden bg-zinc-950 border-r border-zinc-800 shrink-0">
      <div className="flex h-11 items-center justify-between px-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <span className="text-xs font-semibold text-zinc-450">
          {isSubmitted ? "Source Code (Frozen)" : "Code Editor"}
        </span>
        {!isSubmitted && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRun} disabled={isRunning || isSubmitting}
              className="bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-200 h-8">
              {isRunning ? "Running..." : "Run"}
            </Button>
            <Button size="sm" onClick={onSubmit} disabled={isRunning || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-8">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[250px] border-b border-zinc-800">
        <Editor
          height="100%"
          language={MONACO_LANGUAGE_MAP[language]}
          theme="vs-dark"
          value={code}
          onChange={onCodeChange}
          onMount={onEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-mono, monospace)",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            tabSize: 4,
            cursorBlinking: "smooth",
            readOnly: isSubmitted,
          }}
        />
      </div>

      <div className="h-56 flex flex-col overflow-hidden bg-zinc-900/60 shrink-0">
        <div className="flex h-8 items-center justify-between px-3 border-b border-zinc-800 bg-zinc-900/80 shrink-0">
          <span className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider">
            {isSubmitted ? "Test Results" : "Console & Test Cases"}
          </span>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <TestResultsPanel results={runResults} isSubmitted={isSubmitted} />
          <div className="w-[45%] overflow-y-auto p-3 bg-zinc-950/60 font-mono text-[10px] text-zinc-450 whitespace-pre-wrap select-text">
            {consoleOutput || "No logs available."}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestResultsPanel({ results, isSubmitted }: { results: TestRunResult[] | null; isSubmitted: boolean }) {
  return (
    <div className="w-[55%] border-r border-zinc-800 overflow-y-auto p-2.5 space-y-1.5">
      {(!results || results.length === 0) ? (
        <p className="text-[10px] text-zinc-500 italic">
          {isSubmitted ? "No test results recorded." : "No test runs executed yet."}
        </p>
      ) : (
        results.map((tc, index) => {
          const isHidden = tc.visible === false;
          return (
            <div key={tc.testCaseId || index}
              className={`p-2 rounded border text-[10px] space-y-1 transition-colors ${
                tc.passed ? "bg-emerald-950/15 border-emerald-900/40 text-emerald-400" : "bg-rose-950/15 border-rose-900/40 text-rose-400"
              }`}>
              <div className="flex justify-between items-center font-semibold">
                <div className="flex items-center gap-1">
                  <span>Test Case #{index + 1}</span>
                  {isHidden && (
                    <span className="bg-purple-900/30 border border-purple-800/60 text-purple-300 text-[7px] font-bold px-1 rounded uppercase tracking-wide">Hidden</span>
                  )}
                </div>
                <span>{tc.passed ? "Passed" : "Failed"}</span>
              </div>
              {tc.input && (
                <div className="text-[9px] font-mono text-zinc-500">Input: <span className="text-zinc-400">{tc.input}</span></div>
              )}
              <div className="text-[9px] font-mono text-zinc-500">Expected: <span className="text-zinc-400">{tc.expectedOutput}</span></div>
              {!tc.passed && (
                <div className="text-[9px] font-mono text-rose-400/70">Actual: <span className="text-rose-400 font-semibold">{tc.actualOutput.trim()}</span></div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
