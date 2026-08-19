"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { tokenize, type SupportedLanguage } from "@/lib/similarity/tokenizer";
import { computeSimilarity } from "@/lib/similarity/winnowing";

const SIMILARITY_THRESHOLD = 0.4;

export interface SimilarityPair {
  studentAId: string;
  studentBId: string;
  similarity: number;
}

export async function checkSimilarity(assignmentId: string) {
  try {
    if (!assignmentId) throw new Error("Assignment ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new Error("Assignment not found");
    if (assignment.createdBy !== user.id) {
      throw new Error("Unauthorized: You do not own this assignment");
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      select: { studentId: true, code: true },
    });

    const language = assignment.language as SupportedLanguage;
    const tokenized = await Promise.all(
      submissions.map(async (s) => ({
        studentId: s.studentId,
        tokens: await tokenize(s.code, language),
      }))
    );

    const pairs: SimilarityPair[] = [];
    for (let i = 0; i < tokenized.length; i++) {
      for (let j = i + 1; j < tokenized.length; j++) {
        const similarity = computeSimilarity(tokenized[i].tokens, tokenized[j].tokens);
        if (similarity >= SIMILARITY_THRESHOLD) {
          pairs.push({
            studentAId: tokenized[i].studentId,
            studentBId: tokenized[j].studentId,
            similarity,
          });
        }
      }
    }

    pairs.sort((a, b) => b.similarity - a.similarity);

    return { success: true, pairs };
  } catch (err) {
    console.error("Similarity check error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
