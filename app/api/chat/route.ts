import { type NextRequest } from "next/server";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getOrRegenerateHearts } from "@/lib/hearts";
import { getModelWithFallback } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const [supabase, body] = await Promise.all([createClient(), req.json()]);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const { assignmentId, currentCode, lastRunResults, messages } = body;
    const lastUserMessage = messages?.filter((m: { role: string }) => m.role === "user").pop();
    const message = lastUserMessage?.content ?? lastUserMessage?.parts?.find((p: any) => p.type === "text")?.text ?? body.message;
    if (!assignmentId || !message || message.trim() === "") {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const [assignment, hasSubmission, heartsState, model] = await Promise.all([
      prisma.assignment.findUnique({ where: { id: assignmentId } }),
      prisma.submission.findUnique({ where: { studentId_assignmentId: { studentId: user.id, assignmentId } } }),
      getOrRegenerateHearts(user.id, assignmentId),
      getModelWithFallback(assignmentId),
    ]);

    if (!assignment) {
      return new Response(JSON.stringify({ error: "Assignment not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }
    if (hasSubmission) {
      return new Response(JSON.stringify({ error: "Assignment already submitted. Chat is read-only." }), { status: 403, headers: { "Content-Type": "application/json" } });
    }
    if (heartsState.currentCount <= 0) {
      return new Response(JSON.stringify({ error: "0 hearts remaining. Wait for regeneration." }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const [updatedHearts] = await Promise.all([
      prisma.heartsState.update({
        where: { studentId_assignmentId: { studentId: user.id, assignmentId } },
        data: {
          currentCount: heartsState.currentCount - 1,
          totalSpent: heartsState.totalSpent + 1,
          lastRegenAt: heartsState.currentCount === assignment.heartsCount ? new Date() : undefined,
        },
      }),
      prisma.chatMessage.create({
        data: { studentId: user.id, assignmentId, role: "user", content: message.trim() },
      }),
    ]);

    const chatHistory = await prisma.chatMessage.findMany({
      where: { studentId: user.id, assignmentId },
      orderBy: { createdAt: "asc" },
    });
    const formattedHistory = chatHistory.map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content }));

    const tier = Math.min(5, Math.max(1, updatedHearts.totalSpent));
    const systemPrompt = buildSystemPrompt(assignment, currentCode, lastRunResults, updatedHearts.totalSpent, tier);

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

    return result.toUIMessageStreamResponse({
      headers: {
        "X-Accel-Buffering": "no",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("AI Tutor chat error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

function buildSystemPrompt(assignment: any, currentCode: string | undefined, lastRunResults: any, totalSpent: number, tier: number): string {
  return `You are Duck, a friendly rubber-duck debugging companion for GAIT, inspired by CS50's duck debugger persona. You are warm, patient, endlessly encouraging, and occasionally add a light "🦆" or a small quack-flavored remark, but you never let the flavor get in the way of being genuinely useful.
Your task is to guide the student to solve their assignment: "${assignment.title}".

--- ASSIGNMENT INSTRUCTIONS ---
${assignment.instructions}

--- STUDENT CURRENT CODE (READ THIS — it is the student's live code in the editor right now) ---
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

--- HOW TO USE THE STUDENT'S CODE ---
The student's current code is already provided to you above — never ask them to paste it, you can already see it. When the student asks what their code does, what it will print, or to trace/explain execution, walk through it line by line using their actual code and explain the resulting behavior. Tracing and predicting output is a normal comprehension exercise, not a request for the solution — always help with it directly and concretely, quoting the relevant lines back to them.

--- INTENT GUARDRAIL ---
Only reject the student if they explicitly ask you to write the full working solution for them, or to fix their bug by handing them the corrected code outright. In that case, decline warmly and ask a guiding question instead. This guardrail does NOT apply to: explaining what existing code does, tracing/predicting output, explaining error messages, or pointing out (without fixing) where a bug likely is. Use markdown formatting.`;
}
