import type { SubmissionAnalysis } from "@/app/actions/submission-analysis";

export function buildSubmissionAnalysisPrompt(
  analysis: SubmissionAnalysis,
  studentDisplayName: string
): string {
  const similarLines =
    analysis.similarSubmissions
      .map((s) => `  - ${Math.round(s.similarity * 100)}% similar to ${s.displayName}`)
      .join("\n") || "  - none above the similarity threshold";

  return `Here is deterministic data for one student's assignment submission (student: ${studentDisplayName}):

Accuracy:
  - ${analysis.accuracy.passedCount} of ${analysis.accuracy.totalCount} test cases passed (${analysis.accuracy.score}%)

Class comparison:
  - Class average score: ${analysis.classComparison.classAverageScore}%
  - This student's percentile rank: ${analysis.classComparison.percentileRank}th percentile of ${analysis.classComparison.totalSubmissions} submissions

Behavioral signals:
  - Risk flag: ${analysis.behavioralSummary.riskFlag ?? "not computed"}${analysis.behavioralSummary.riskTotal !== null ? ` (score ${Math.round(analysis.behavioralSummary.riskTotal)})` : ""}
  - Paste events: ${analysis.behavioralSummary.pasteCount}
  - Keystrokes: ${analysis.behavioralSummary.keystrokeCount}
  - Typing speed: ${analysis.behavioralSummary.wpm} WPM
  - Focus time: ${Math.round(analysis.behavioralSummary.totalFocusTimeSecs / 60)} minutes

Similar submissions:
${similarLines}

Write a 3-5 sentence overall report on this student's submission for an instructor. Base your summary only on the numbers given above; do not invent additional data. Note academic integrity concerns only if the risk flag or similarity data supports it. End with one concrete instructor recommendation.`;
}
