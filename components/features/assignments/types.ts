export interface AssignmentData {
  id: string;
  title: string;
  instructions: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  heartsRegenMinutes: number;
  instructorEmail: string;
}

export interface HeartsStateData {
  currentCount: number;
  lastRegenAt: string;
  totalSpent: number;
}

export interface TestCaseData {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface SubmissionData {
  id: string;
  code: string;
  score: number;
  testResults: any;
  submittedAt: string;
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface WorkspaceViewProps {
  assignment: AssignmentData;
  initialHearts: HeartsStateData;
  visibleTestCases: TestCaseData[];
  initialSubmission: SubmissionData | null;
  initialChatMessages: ChatMessageData[];
  initialDraftCode: string | null;
}

export interface TestRunResult {
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
