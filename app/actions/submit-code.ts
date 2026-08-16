"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { awardSubmissionXp } from "@/lib/gamification";

interface BehavioralSignals {
  pasteCount: number;
  pasteLength: number;
  keystrokeCount: number;
  wpm: number;
  totalFocusTimeSecs: number;
}

const LANGUAGE_MAP: Record<string, number> = {
  Python: 100,      // Python (3.12.5)
  C: 103,           // C (GCC 14.1.0)
  JavaScript: 102,  // JavaScript (Node.js 22.08.0)
  "C#": 51,         // C# (Mono 6.6.0.161)
};

export async function submitCode(
  assignmentId: string,
  code: string,
  behavioralSignals: BehavioralSignals
) {
  try {
    if (!assignmentId) {
      throw new Error("Assignment ID is required");
    }
    if (code === undefined || code === null) {
      throw new Error("Code content is required");
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: {
        studentId_assignmentId: {
          studentId: user.id,
          assignmentId,
        },
      },
    });

    if (existingSubmission) {
      throw new Error("Duplicate Submission: You have already submitted this assignment.");
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        testCases: true,
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const now = new Date();
    if (now > new Date(assignment.dueDate)) {
      throw new Error("Late Submission: The submission deadline has passed. Submissions are no longer accepted.");
    }

    const langId = LANGUAGE_MAP[assignment.language];
    if (!langId) {
      throw new Error(`Unsupported programming language: ${assignment.language}`);
    }

    const testCasesToRun = assignment.testCases.length > 0 
      ? assignment.testCases 
      : [{ id: "default", input: "", expectedOutput: "", visible: true }];

    const runPromises = testCasesToRun.map(async (tc) => {
      try {
        const response = await fetch("https://ce.judge0.com/submissions?wait=true&base64_encoded=false", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_code: code,
            language_id: langId,
            stdin: tc.input || "",
            expected_output: tc.expectedOutput || undefined,
            cpu_time_limit: 10.0, // 10 seconds execution limit
          }),
        });

        if (!response.ok) {
          throw new Error(`Judge0 responded with status: ${response.status}`);
        }

        const result = await response.json();
        
        const stdout = result.stdout || "";
        const stderr = result.stderr || "";
        const compileOutput = result.compile_output || "";
        const status = result.status || { id: 13, description: "Internal Error" };

        let passed = false;
        if (status.id === 3) {
          const cleanActual = stdout.trim().replace(/\r\n/g, "\n");
          const cleanExpected = (tc.expectedOutput || "").trim().replace(/\r\n/g, "\n");
          passed = cleanActual === cleanExpected;
        }

        return {
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: stdout || stderr || compileOutput || "",
          stderr,
          compileOutput,
          status,
          passed,
          visible: "visible" in tc ? tc.visible : true,
        };
      } catch (err) {
        return {
          testCaseId: tc.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: err instanceof Error ? err.message : "Error executing test case",
          stderr: err instanceof Error ? err.message : "Error",
          compileOutput: "",
          status: { id: 13, description: "Connection Error" },
          passed: false,
          visible: "visible" in tc ? tc.visible : true,
        };
      }
    });

    const results = await Promise.all(runPromises);

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const scoreFraction = totalCount > 0 ? passedCount / totalCount : 0.0;
    const scorePercentage = Math.round(scoreFraction * 100 * 100) / 100; // Store as 0-100 score value

    const submission = await prisma.submission.create({
      data: {
        studentId: user.id,
        assignmentId,
        code,
        score: scorePercentage,
        testResults: results as any,
        behavioralSignals: behavioralSignals as any,
      },
    });

    const heartsState = await prisma.heartsState.findUnique({
      where: { studentId_assignmentId: { studentId: user.id, assignmentId } },
    });
    const totalHintsUsed = heartsState?.totalSpent || 0;
    await awardSubmissionXp(user.id, assignmentId, scorePercentage, totalHintsUsed);

    return {
      success: true,
      submission: {
        id: submission.id,
        code: submission.code,
        score: submission.score,
        testResults: results,
        submittedAt: submission.submittedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Code submission error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
