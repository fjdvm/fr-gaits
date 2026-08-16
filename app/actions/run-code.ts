"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// Rate limiting: max 5 runs per minute per student
const RUN_LIMIT = 5;
const LIMIT_WINDOW_MS = 60000;
const runHistory = new Map<string, number[]>();

function checkRateLimit(userId: string): { allowed: boolean; remainingSecs?: number } {
  const now = Date.now();
  const history = runHistory.get(userId) || [];
  
  // Filter runs within the last minute
  const recentRuns = history.filter((timestamp) => now - timestamp < LIMIT_WINDOW_MS);
  
  if (recentRuns.length >= RUN_LIMIT) {
    const oldestRecentRun = recentRuns[0];
    const remainingMs = LIMIT_WINDOW_MS - (now - oldestRecentRun);
    return {
      allowed: false,
      remainingSecs: Math.max(1, Math.ceil(remainingMs / 1000)),
    };
  }
  
  recentRuns.push(now);
  runHistory.set(userId, recentRuns);
  return { allowed: true };
}

// Map assignment languages to Judge0 language IDs
const LANGUAGE_MAP: Record<string, number> = {
  Python: 100,      // Python (3.12.5)
  C: 103,           // C (GCC 14.1.0)
  JavaScript: 102,  // JavaScript (Node.js 22.08.0)
  "C#": 51,         // C# (Mono 6.6.0.161)
};

export async function runCode(assignmentId: string, code: string) {
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

    // Rate limiting check
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      throw new Error(
        `Rate limit exceeded. You can only run code 5 times per minute. Please wait ${rateLimit.remainingSecs} seconds.`
      );
    }

    // Fetch assignment and its visible test cases
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        testCases: {
          where: { visible: true },
        },
      },
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const langId = LANGUAGE_MAP[assignment.language];
    if (!langId) {
      throw new Error(`Unsupported programming language: ${assignment.language}`);
    }

    // If there are no visible test cases, we just run the code once without stdin
    const testCasesToRun = assignment.testCases.length > 0 
      ? assignment.testCases 
      : [{ id: "default", input: "", expectedOutput: "", visible: true }];

    // Run test cases in parallel using Judge0 API
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

        // Determine if it passed
        let passed = false;
        if (status.id === 3) {
          // If execution succeeded (Accepted), check if output matches expected output
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
        };
      }
    });

    const results = await Promise.all(runPromises);

    return {
      success: true,
      results,
    };
  } catch (err) {
    console.error("Code run error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
