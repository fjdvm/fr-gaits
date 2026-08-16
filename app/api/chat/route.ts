import { type NextRequest } from "next/server";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getOrRegenerateHearts } from "@/lib/hearts";
import { getModelWithFallback } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const { assignmentId, message, currentCode, lastRunResults } = await req.json();
    if (!assignmentId || !message || message.trim() === "") {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      return new Response(JSON.stringify({ error: "Assignment not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    const hasSubmission = await prisma.submission.findUnique({
      where: { studentId_assignmentId: { studentId: user.id, assignmentId } },
    });
    if (hasSubmission) {
      return new Response(JSON.stringify({ error: "Assignment already submitted. Chat is read-only." }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    let heartsState = await getOrRegenerateHearts(user.id, assignmentId);
    if (heartsState.currentCount <= 0) {
      return new Response(JSON.stringify({ error: "0 hearts remaining. Wait for regeneration." }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    // Decrement hearts
    heartsState = await prisma.heartsState.update({
      where: { studentId_assignmentId: { studentId: user.id, assignmentId } },
      data: {
        currentCount: heartsState.currentCount - 1,
        totalSpent: heartsState.totalSpent + 1,
        lastRegenAt: heartsState.currentCount === assignment.heartsCount ? new Date() : undefined,
      },
    });

    // Save user message
    await prisma.chatMessage.create({
      data: { studentId: user.id, assignmentId, role: "user", content: message.trim() },
    });

    // Load chat history
    const chatHistory = await prisma.chatMessage.findMany({
      where: { studentId: user.id, assignmentId },
      orderBy: { createdAt: "asc" },
    });
    const formattedHistory = chatHistory.map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content }));

    // Build tiered system prompt
    const tier = Math.min(5, Math.max(1, heartsState.totalSpent));
    const systemPrompt = buildSystemPrompt(assignment, currentCode, lastRunResults, heartsState.totalSpent, tier);

    // Get model with fallback (instructor key -> default)
    const model = await getModelWithFallback(assignmentId);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: formattedHistory,
      onFinish: async ({ text }) => {
        await prisma.chatMessage.create({
          data: { studentId: user.id, assignmentId, role: "assistant", content: text },
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("AI Tutor chat error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

function buildSystemPrompt(assignment: any, currentCode: string | undefined, lastRunResults: any, totalSpent: number, tier: number): string {
  return `You are a helpful, encouraging AI Programming Tutor for GAIT.
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
The student has spent ${totalSpent} hearts. Current Tier: ${tier}
- Tier 1: Vague conceptual nudge only.
- Tier 2: General strategy nudge at a high level.
- Tier 3: Specific logic details, step-by-step.
- Tier 4: Detailed structural outline (control structures, variable outlines).
- Tier 5: Near-pseudocode or direct logic translation.

--- INTENT GUARDRAIL ---
If the student asks for the complete solution or direct code, REJECT the request. Ask Socratic questions instead. Never output code that directly solves the assignment. Focus on pedagogy. Use markdown formatting.`;
}
