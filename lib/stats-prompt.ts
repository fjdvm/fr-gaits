import type { AssignmentStats } from "@/app/actions/assignment-stats";

export function buildStatsPrompt(stats: AssignmentStats): string {
  const hintLines = stats.hintUsageCorrelation
    .map((h) => `  - ${h.bucket} hints used: average score ${h.averageScore}%`)
    .join("\n");

  const riskLines = Object.entries(stats.riskFlagCounts)
    .map(([flag, count]) => `  - ${flag}: ${count}`)
    .join("\n") || "  - none flagged";

  return `Here is deterministic class performance data for one assignment (${stats.totalSubmissions} submissions):

Score summary:
  - Average score: ${stats.averageScore}%
  - Median score: ${stats.medianScore}%
  - Score distribution: ${stats.scoreDistribution.low} students scored 0-40%, ${stats.scoreDistribution.mid} scored 40-70%, ${stats.scoreDistribution.high} scored 70-100%

Most-failed test case:
  - ${stats.mostFailedTestCase ? `Test case ${stats.mostFailedTestCase.testCaseId} failed by ${stats.mostFailedTestCase.failCount} students` : "No test case failures recorded"}

Hint usage correlation:
${hintLines}

Behavioral risk flags:
${riskLines}

Submission timing:
  - ${stats.submittedInLastHourCount} of ${stats.totalSubmissions} submissions were made within the last hour before the deadline

Write a 3-5 sentence summary of common struggles in this class, and end with one concrete instructor recommendation. Base your summary only on the numbers given above; do not invent additional data.`;
}
