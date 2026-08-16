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
    <div className="w-[42%] flex flex-col h-full overflow-hidden bg-card border-r border-border shrink-0">
      <div className="flex h-11 items-center justify-between px-4 border-b border-border bg-muted/50 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground">
          {isSubmitted ? "Source Code (Frozen)" : "Code Editor"}
        </span>
        {!isSubmitted && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRun} disabled={isRunning || isSubmitting}
              className="h-8">
              {isRunning ? "Running..." : "Run"}
            </Button>
            <Button size="sm" onClick={onSubmit} disabled={isRunning || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-[250px] border-b border-border">
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

      <div className="h-56 flex flex-col overflow-hidden bg-muted/30 shrink-0">
        <div className="flex h-8 items-center justify-between px-3 border-b border-border bg-muted/50 shrink-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {isSubmitted ? "Test Results" : "Console & Test Cases"}
          </span>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <TestResultsPanel results={runResults} isSubmitted={isSubmitted} />
          <div className="w-[45%] overflow-y-auto p-3 bg-muted/20 font-mono text-[10px] text-muted-foreground whitespace-pre-wrap select-text">
            {consoleOutput || "No logs available."}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestResultsPanel({ results, isSubmitted }: { results: TestRunResult[] | null; isSubmitted: boolean }) {
  return (
    <div className="w-[55%] border-r border-border overflow-y-auto p-2.5 space-y-1.5">
      {(!results || results.length === 0) ? (
        <p className="text-[10px] text-muted-foreground italic">
          {isSubmitted ? "No test results recorded." : "No test runs executed yet."}
        </p>
      ) : (
        results.map((tc, index) => {
          const isHidden = tc.visible === false;
          return (
            <div key={tc.testCaseId || index}
              className={`p-2 rounded border text-[10px] space-y-1 transition-colors ${
                tc.passed ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
              }`}>
              <div className="flex justify-between items-center font-semibold">
                <div className="flex items-center gap-1">
                  <span>Test Case #{index + 1}</span>
                  {isHidden && (
                    <span className="bg-purple-100 border border-purple-300 text-purple-700 text-[7px] font-bold px-1 rounded uppercase tracking-wide">Hidden</span>
                  )}
                </div>
                <span>{tc.passed ? "Passed" : "Failed"}</span>
              </div>
              {tc.input && (
                <div className="text-[9px] font-mono text-muted-foreground">Input: <span className="text-foreground">{tc.input}</span></div>
              )}
              <div className="text-[9px] font-mono text-muted-foreground">Expected: <span className="text-foreground">{tc.expectedOutput}</span></div>
              {!tc.passed && (
                <div className="text-[9px] font-mono text-red-600">Actual: <span className="text-red-700 font-semibold">{tc.actualOutput.trim()}</span></div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
