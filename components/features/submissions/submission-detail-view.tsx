"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import Editor from "@monaco-editor/react";
import { CheckCircle2, XCircle, Brain, Clock, Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import { BehaviorTab } from "./components/behavior-tab";

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  Python: "python",
  C: "c",
  JavaScript: "javascript",
  "C#": "csharp",
};

interface TestResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  visible?: boolean;
}

interface BehavioralSignals {
  pasteCount: number;
  pasteLength: number;
  keystrokeCount: number;
  wpm: number;
  totalFocusTimeSecs: number;
}

interface ChatMsg {
  role: string;
  content: string;
  createdAt: string;
}

interface SubmissionDetailViewProps {
  assignmentTitle: string;
  assignmentLanguage: string;
  studentEmail: string;
  submission: {
    code: string;
    score: number;
    testResults: TestResult[];
    behavioralSignals: BehavioralSignals;
    submittedAt: string;
  } | null;
  chatMessages: ChatMsg[];
}

export function SubmissionDetailView({
  assignmentTitle,
  assignmentLanguage,
  studentEmail,
  submission,
  chatMessages,
}: SubmissionDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"tests" | "behavior" | "chat">("tests");

  if (!submission) {
    return (
      <>
        <DashboardHeader title={`${studentEmail} — ${assignmentTitle}`} description="Submission details" />
        <main className="p-6 md:p-10 flex-grow">
          <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-secondary/30 mb-4" />
            <h3 className="font-bold text-lg">No submission yet</h3>
            <p className="text-xs text-secondary mt-1">This student has not submitted this assignment yet.</p>
          </div>
        </main>
      </>
    );
  }

  // Calculate assertions count
  const totalTests = submission.testResults.length;
  const passedTests = submission.testResults.filter((tr) => tr.passed).length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <>
      <DashboardHeader
        title={`${studentEmail} — ${assignmentTitle}`}
        description={`Submitted at: ${new Date(submission.submittedAt).toLocaleString()}`}
      />
      <main className="flex-grow overflow-hidden p-6 md:p-10 flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Left Pane: Code Viewer */}
        <section className="flex-grow lg:flex-[3] bg-white rounded-3xl border border-surface-container flex flex-col overflow-hidden shadow-sm">
          <div className="px-6 py-4 bg-surface-container-low/50 border-b border-surface-container flex justify-between items-center shrink-0">
            <div>
              <h3 className="font-bold text-sm text-on-surface">Submitted Code</h3>
              <p className="text-[10px] text-secondary font-semibold font-mono uppercase mt-0.5">{assignmentLanguage}</p>
            </div>
            <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {submission.score}% Score
            </span>
          </div>
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={MONACO_LANGUAGE_MAP[assignmentLanguage] || "plaintext"}
              theme="vs-dark"
              value={submission.code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </section>

        {/* Right Pane: Analysis Tabs */}
        <section className="flex-grow lg:flex-[2] bg-white rounded-3xl border border-surface-container flex flex-col overflow-hidden shadow-sm">
          {/* Tab Switcher */}
          <div className="flex bg-surface-container-low border-b border-surface-container shrink-0 p-1">
            <button
              onClick={() => setActiveTab("tests")}
              className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "tests" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-on-surface"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Test Results
            </button>
            <button
              onClick={() => setActiveTab("behavior")}
              className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "behavior" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-on-surface"
              }`}
            >
              <Brain className="h-4 w-4" />
              Behavior
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "chat" ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-on-surface"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Tutor Log
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "tests" && (
              <div className="space-y-6">
                <div className="bg-surface-container-low rounded-2xl p-5 border border-surface-container flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">Test Suite Pass Rate</h4>
                    <p className="text-xs text-secondary mt-1">{passedTests} of {totalTests} assertions passed.</p>
                  </div>
                  <div className="w-14 h-14 rounded-full border-4 border-primary/20 flex items-center justify-center bg-white">
                    <span className="font-bold text-sm text-on-surface">{passRate}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-secondary uppercase tracking-wider mb-2 pl-1">Detailed Logs</h4>
                  {submission.testResults.map((tr, index) => (
                    <div
                      key={tr.testCaseId || index}
                      className={`flex gap-3 p-4 rounded-2xl border ${
                        tr.passed
                          ? "bg-white border-surface-container"
                          : "bg-destructive/5 border-destructive/20"
                      }`}
                    >
                      {tr.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold truncate ${tr.passed ? "text-on-surface" : "text-destructive"}`}>
                            Case #{index + 1} {tr.visible === false && "(Hidden)"}
                          </span>
                          <span className="text-[10px] text-secondary font-mono">Assertion</span>
                        </div>
                        <p className="text-xs text-secondary font-mono bg-surface-container-low p-2 rounded-lg mt-1 whitespace-pre-wrap truncate">
                          In: {tr.input || "—"}
                        </p>
                        <p className="text-xs text-secondary font-mono bg-surface-container-low p-2 rounded-lg mt-1 whitespace-pre-wrap truncate">
                          Out: {tr.actualOutput?.trim() || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "behavior" && (
              <BehaviorTab behavioralSignals={submission.behavioralSignals} />
            )}

            {activeTab === "chat" && (
              <div className="space-y-4 flex flex-col h-full">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-10 w-10 text-secondary/30 mx-auto mb-2" />
                    <p className="text-xs text-secondary font-semibold">No tutor conversations logged.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-2xl text-xs border ${
                          msg.role === "assistant"
                            ? "bg-surface-container-low border-surface-container text-on-surface"
                            : "bg-primary-container/10 border-primary-container/20 text-on-surface"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2 font-bold text-[9px] uppercase tracking-wider text-secondary">
                          <span>{msg.role === "assistant" ? "AI Tutor" : "Student"}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
