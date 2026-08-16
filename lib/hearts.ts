import { prisma } from "./prisma";

export async function getOrRegenerateHearts(studentId: string, assignmentId: string) {
  // 1. Fetch assignment config and student's hearts state
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  let heartsState = await prisma.heartsState.findUnique({
    where: {
      studentId_assignmentId: {
        studentId,
        assignmentId,
      },
    },
  });

  // If no hearts state exists, initialize it
  if (!heartsState) {
    heartsState = await prisma.heartsState.create({
      data: {
        studentId,
        assignmentId,
        currentCount: assignment.heartsCount,
        lastRegenAt: new Date(),
        totalSpent: 0,
      },
    });
    return heartsState;
  }

  // 2. Perform lazy regeneration if they are below the max limit
  if (heartsState.currentCount < assignment.heartsCount) {
    const now = new Date();
    const elapsedMs = now.getTime() - new Date(heartsState.lastRegenAt).getTime();
    const cooldownMs = assignment.heartsRegenMinutes * 60 * 1000;

    if (elapsedMs >= cooldownMs) {
      const regeneratedHearts = Math.floor(elapsedMs / cooldownMs);
      const newCount = Math.min(assignment.heartsCount, heartsState.currentCount + regeneratedHearts);
      
      // Shift lastRegenAt forward by the exact regenerated time blocks to preserve fractional progress
      const newRegenTime = new Date(heartsState.lastRegenAt.getTime() + regeneratedHearts * cooldownMs);
      
      // If we hit the max cap, set the regen time to now (since regen stops)
      const finalRegenTime = newCount === assignment.heartsCount ? now : newRegenTime;

      heartsState = await prisma.heartsState.update({
        where: {
          studentId_assignmentId: {
            studentId,
            assignmentId,
          },
        },
        data: {
          currentCount: newCount,
          lastRegenAt: finalRegenTime,
        },
      });
    }
  }

  return heartsState;
}
