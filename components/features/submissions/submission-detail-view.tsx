"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import Editor from "@monaco-editor/react";
import { CheckCircle2, Brain, MessageSquare, AlertCircle } from "lucide-react";
import { BehaviorTab } from "./components/behavior-tab";
import { TutorLogTab } from "./components/tutor-log-tab";
import { TestResultsTab } from "./components/test-results-tab";
import { getDisplayName } from "@/lib/display-name";
import type { BehavioralSignals } from "@/lib/types/behavioral-signals";

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

interface ChatMsg {
  role: string;
  content: string;
  createdAt: string;
}

interface SubmissionDetailViewProps {
  assignmentTitle: string;
  assignmentLanguage: string;
  studentEmail: string;
  studentName: string | null;
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
  studentName,
  submission,
  chatMessages,
}: SubmissionDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"tests" | "behavior" | "chat">("tests");
  const studentDisplayName = getDisplayName({ name: studentName, email: studentEmail });

  if (!submission) {
    return (
      <>
        <DashboardHeader title={`${studentDisplayName} — ${assignmentTitle}`} description={studentEmail} />
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

  return (
    <>
      <DashboardHeader
        title={`${studentDisplayName} — ${assignmentTitle}`}
        description={`${studentEmail} · Submitted at: ${new Date(submission.submittedAt).toLocaleString()}`}
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
              <TestResultsTab testResults={submission.testResults} />
            )}

            {activeTab === "behavior" && (
              <BehaviorTab behavioralSignals={submission.behavioralSignals} />
            )}

            {activeTab === "chat" && (
              <TutorLogTab chatMessages={chatMessages} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
