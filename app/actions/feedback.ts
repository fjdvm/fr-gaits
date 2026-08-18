"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const GITHUB_REPO = "fjdvm/fr-gaits";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/issues`;

export async function submitFeedback(title: string, description: string, pageUrl: string) {
  try {
    if (!title || title.trim() === "") throw new Error("A short title is required");
    if (!description || description.trim() === "") throw new Error("A description is required");

    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("Feedback submission is not configured");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, role: true } });

    const body = [
      description.trim(),
      "",
      "---",
      `Reported by: ${dbUser?.email ?? "unknown"} (${dbUser?.role ?? "unknown"})`,
      `Page: ${pageUrl}`,
    ].join("\n");

    const response = await fetch(GITHUB_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: title.trim(),
        body,
        labels: ["user-feedback"],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errText}`);
    }

    const issue = await response.json();
    return { success: true, issueUrl: issue.html_url as string, issueNumber: issue.number as number };
  } catch (err) {
    console.error("Failed to submit feedback:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
