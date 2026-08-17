"use client";

import Editor from "@monaco-editor/react";
import { Play, CheckCircle2, XCircle, Terminal, FileCode, Send } from "lucide-react";

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
    <div className="w-[42%] flex flex-col h-full overflow-hidden bg-white border-r border-surface-container shrink-0">
      {/* Editor Tab Bar */}
      <div className="bg-[#1e1e1e] px-4 py-2 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#1e1e1e] px-4 py-1.5 rounded-t-lg border-t border-x border-primary/30 text-white">
            <FileCode className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">main.{language === "Python" ? "py" : language === "JavaScript" ? "js" : "c"}</span>
          </div>
        </div>
        {!isSubmitted && (
          <div className="flex gap-2">
            <button
              onClick={onRun}
              disabled={isRunning || isSubmitting}
              className="px-4 py-1.5 bg-[#2d2d2d] hover:bg-[#3d3d3d] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Play className="h-3.5 w-3.5 text-primary" />
              {isRunning ? "Running..." : "Run"}
            </button>
            <button
              onClick={onSubmit}
              disabled={isRunning || isSubmitting}
              className="px-4 py-1.5 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}
      </div>

      {/* Editor Canvas */}
      <div className="flex-grow min-h-[250px] border-b border-surface-container">
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

      {/* Console and Output */}
      <div className="h-56 flex flex-col overflow-hidden bg-white shrink-0">
        <div className="flex h-10 items-center justify-between px-4 border-b border-surface-container bg-surface-container-low/50 shrink-0">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" />
            {isSubmitted ? "Test Results" : "Console & Test Cases"}
          </span>
        </div>
        <div className="flex-1 flex overflow-hidden bg-white">
          <TestResultsPanel results={runResults} isSubmitted={isSubmitted} />
          <div className="w-[45%] overflow-y-auto p-4 bg-surface-container-low/30 font-mono text-[10px] text-secondary whitespace-pre-wrap select-text leading-relaxed">
            {consoleOutput || "No logs available. Execute run to see compiler output."}
          </div>
        </div>
      </div>
    </div>
  );
}

function TestResultsPanel({ results, isSubmitted }: { results: TestRunResult[] | null; isSubmitted: boolean }) {
  return (
    <div className="w-[55%] border-r border-surface-container overflow-y-auto p-4 space-y-2 bg-white">
      {(!results || results.length === 0) ? (
        <p className="text-[10px] text-secondary italic">
          {isSubmitted ? "No test results recorded." : "No test runs executed yet."}
        </p>
      ) : (
        results.map((tc, index) => {
          const isHidden = tc.visible === false;
          return (
            <div key={tc.testCaseId || index}
              className={`p-3 rounded-xl border text-[10px] space-y-1 transition-colors ${
                tc.passed
                  ? "bg-white border-surface-container text-on-surface"
                  : "bg-destructive/5 border-destructive/20 text-on-surface"
              }`}>
              <div className="flex justify-between items-center font-bold text-[10px]">
                <div className="flex items-center gap-1">
                  <span>Case #{index + 1}</span>
                  {isHidden && (
                    <span className="bg-primary-container text-on-primary-container text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Hidden</span>
                  )}
                </div>
                <span className="flex items-center gap-1">
                  {tc.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                  )}
                  {tc.passed ? "Passed" : "Failed"}
                </span>
              </div>
              {tc.input && (
                <div className="text-[9px] font-mono text-secondary">Input: <span className="text-on-surface font-semibold">{tc.input}</span></div>
              )}
              <div className="text-[9px] font-mono text-secondary">Expected: <span className="text-on-surface font-semibold">{tc.expectedOutput}</span></div>
              {!tc.passed && (
                <div className="text-[9px] font-mono text-destructive">Actual: <span className="text-destructive font-bold">{tc.actualOutput.trim()}</span></div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
