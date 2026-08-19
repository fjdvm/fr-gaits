import { describe, expect, it } from "vitest";
import { buildStatsPrompt } from "./stats-prompt";
import type { AssignmentStats } from "@/app/actions/assignment-stats";

describe("buildStatsPrompt", () => {
  it("includes every computed stat field in the prompt text, and no raw code", () => {
    const stats: AssignmentStats = {
      totalSubmissions: 3,
      averageScore: 50,
      medianScore: 50,
      scoreDistribution: { low: 1, mid: 1, high: 1 },
      mostFailedTestCase: { testCaseId: "tc-b", failCount: 2 },
      hintUsageCorrelation: [
        { bucket: "0", averageScore: 100 },
        { bucket: "1-3", averageScore: 50 },
        { bucket: "4+", averageScore: 0 },
      ],
      riskFlagCounts: { Low: 1, Medium: 1, High: 1 },
      submittedInLastHourCount: 2,
    };

    const prompt = buildStatsPrompt(stats);

    expect(prompt).toContain("50");
    expect(prompt).toContain("tc-b");
    expect(prompt).toContain("2");
    expect(prompt).not.toContain("def ");
    expect(prompt).not.toContain("function ");
  });
});
