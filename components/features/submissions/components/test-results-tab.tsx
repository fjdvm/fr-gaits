import { CheckCircle2, XCircle } from "lucide-react";

interface TestResult {
  testCaseId: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  visible?: boolean;
}

interface TestResultsTabProps {
  testResults: TestResult[];
}

export function TestResultsTab({ testResults }: TestResultsTabProps) {
  const totalTests = testResults.length;
  const passedTests = testResults.filter((tr) => tr.passed).length;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
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
        {testResults.map((tr, index) => (
          <div
            key={tr.testCaseId || index}
            className={`flex gap-3 p-4 rounded-2xl border ${
              tr.passed ? "bg-white border-surface-container" : "bg-destructive/5 border-destructive/20"
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
  );
}
