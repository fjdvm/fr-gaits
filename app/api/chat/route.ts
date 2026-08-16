import { type NextRequest } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getOrRegenerateHearts } from "@/lib/hearts";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Parse request parameters
    const { assignmentId, message, currentCode, lastRunResults } = await req.json();

    if (!assignmentId || !message || message.trim() === "") {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Load assignment and check due date / submission status
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return new Response(JSON.stringify({ error: "Assignment not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hasSubmission = await prisma.submission.findUnique({
      where: {
        studentId_assignmentId: {
          studentId: user.id,
          assignmentId,
        },
      },
    });

    if (hasSubmission) {
      return new Response(JSON.stringify({ error: "Assignment is already submitted. Chat is read-only." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Fetch/regenerate hearts state
    let heartsState = await getOrRegenerateHearts(user.id, assignmentId);

    // If student has 0 hearts, reject sending new messages
    if (heartsState.currentCount <= 0) {
      return new Response(
        JSON.stringify({
          error: "You have 0 hearts remaining. Wait for hearts to regenerate before sending new messages.",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if Gemini API Key is configured in environment
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "AI Tutor is currently offline. Please configure GOOGLE_GENERATIVE_AI_API_KEY in your environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Decrement heart count for this assignment and increment spent count
    heartsState = await prisma.heartsState.update({
      where: {
        studentId_assignmentId: {
          studentId: user.id,
          assignmentId,
        },
      },
      data: {
        currentCount: heartsState.currentCount - 1,
        totalSpent: heartsState.totalSpent + 1,
        lastRegenAt: heartsState.currentCount === assignment.heartsCount ? new Date() : undefined, // Start regen timer if we just fell below max
      },
    });

    // 6. Save student's user message to the database
    await prisma.chatMessage.create({
      data: {
        studentId: user.id,
        assignmentId,
        role: "user",
        content: message.trim(),
      },
    });

    // 7. Load all previous chat history for LLM context
    const chatHistory = await prisma.chatMessage.findMany({
      where: {
        studentId: user.id,
        assignmentId,
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // 8. Build the Tiered System Prompt
    const tier = Math.min(5, Math.max(1, heartsState.totalSpent));
    const systemPrompt = `You are a helpful, encouraging AI Programming Tutor for GAIT.
Your task is to guide the student to solve their assignment: "${assignment.title}".

--- ASSIGNMENT INSTRUCTIONS ---
${assignment.instructions}

--- STUDENT CURRENT CODE ---
Language: ${assignment.language}
\`\`\`${assignment.language.toLowerCase()}
${currentCode || "// No code written yet"}
\`\`\`

--- LAST RUN TEST RESULTS ---
${JSON.stringify(lastRunResults || [], null, 2)}

--- HINT TIER LEVEL ---
The student has spent ${heartsState.totalSpent} hearts on hints for this assignment.
Current Tier: Tier ${tier}
- Tier 1: Vague conceptual nudge. Explain the concepts, do not suggest specific code changes or direct syntax.
- Tier 2: General strategy nudge. Outline the approach at a high level (e.g. "We need to loop through the string from right to left").
- Tier 3: Specific logic details. Walk through the logic step-by-step.
- Tier 4: Detailed structural outline of the code (e.g., control structures, variable outlines, structure of functions).
- Tier 5: Near-pseudocode or direct logic translation.

--- INTENT GUARDRAIL ---
If the student asks for the complete solution, direct code blocks, or asks you to write code for them, you MUST reject the request. Instead, ask Socratic questions that guide them towards writing it themselves.
Never write or output code that directly solves the assignment for the student. Focus on pedagogy. Use markdown formatting.`;

    // 9. Call Vercel AI SDK streamText with Gemini
    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages: formattedHistory,
      onFinish: async ({ text }) => {
        // Save the AI Tutor's response to the database upon streaming completion
        await prisma.chatMessage.create({
          data: {
            studentId: user.id,
            assignmentId,
            role: "assistant",
            content: text,
          },
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("AI Tutor chat error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
