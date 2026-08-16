"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import Editor from "@monaco-editor/react";

const MONACO_LANGUAGE_MAP: Record<string, string> = { Python: "python", C: "c", JavaScript: "javascript", "C#": "csharp" };

interface TestResult { testCaseId: string; input: string; expectedOutput: string; actualOutput: string; passed: boolean; visible?: boolean; }
interface BehavioralSignals { pasteCount: number; pasteLength: number; keystrokeCount: number; wpm: number; totalFocusTimeSecs: number; }
interface ChatMsg { role: string; content: string; createdAt: string; }

interface SubmissionDetailViewProps {
  assignmentTitle: string;
  assignmentLanguage: string;
  studentEmail: string;
  submission: { code: string; score: number; testResults: TestResult[]; behavioralSignals: BehavioralSignals; submittedAt: string; } | null;
  chatMessages: ChatMsg[];
}

export function SubmissionDetailView({ assignmentTitle, assignmentLanguage, studentEmail, submission, chatMessages }: SubmissionDetailViewProps) {
  return (
    <>
      <DashboardHeader title={`${studentEmail} — ${assignmentTitle}`} description="Submission details, test results, chat history, and behavioral signals." />
      <main className="p-6 space-y-6">
        {!submission ? (
          <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">This student has not submitted yet.</p></CardContent></Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Score</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{submission.score}%</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Submitted</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">{new Date(submission.submittedAt).toLocaleString()}</p></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Language</CardTitle></CardHeader><CardContent><p className="text-sm font-medium">{assignmentLanguage}</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle>Submitted Code</CardTitle></CardHeader>
              <CardContent>
                <div className="h-72 border rounded-lg overflow-hidden">
                  <Editor height="100%" language={MONACO_LANGUAGE_MAP[assignmentLanguage] || "plaintext"} theme="vs-dark" value={submission.code} options={{ readOnly: true, minimap: { enabled: false }, fontSize: 12, scrollBeyondLastLine: false }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Test Results</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Input</TableHead><TableHead>Expected</TableHead><TableHead>Actual</TableHead><TableHead>Result</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {submission.testResults.map((tr, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}{tr.visible === false && " (Hidden)"}</TableCell>
                        <TableCell className="font-mono text-xs">{tr.input || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{tr.expectedOutput}</TableCell>
                        <TableCell className="font-mono text-xs">{tr.actualOutput?.trim() || "—"}</TableCell>
                        <TableCell>{tr.passed ? <span className="text-green-600 font-semibold">Pass</span> : <span className="text-red-600 font-semibold">Fail</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Behavioral Signals</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">Raw data — no computed suspicion scores.</p>
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="text-center"><p className="text-xs text-muted-foreground">Paste Events</p><p className="text-lg font-bold">{submission.behavioralSignals.pasteCount}</p></div>
                  <div className="text-center"><p className="text-xs text-muted-foreground">Paste Chars</p><p className="text-lg font-bold">{submission.behavioralSignals.pasteLength}</p></div>
                  <div className="text-center"><p className="text-xs text-muted-foreground">Keystrokes</p><p className="text-lg font-bold">{submission.behavioralSignals.keystrokeCount}</p></div>
                  <div className="text-center"><p className="text-xs text-muted-foreground">Typing Speed</p><p className="text-lg font-bold">{submission.behavioralSignals.wpm} WPM</p></div>
                  <div className="text-center"><p className="text-xs text-muted-foreground">Time Spent</p><p className="text-lg font-bold">{Math.round(submission.behavioralSignals.totalFocusTimeSecs / 60)}m</p></div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader><CardTitle>AI Tutor Conversation ({chatMessages.length} messages)</CardTitle></CardHeader>
          <CardContent>
            {chatMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tutor conversations for this student.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm ${msg.role === "assistant" ? "bg-muted" : "bg-primary/5 border"}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold uppercase text-muted-foreground">{msg.role === "assistant" ? "AI Tutor" : "Student"}</span>
                      <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
