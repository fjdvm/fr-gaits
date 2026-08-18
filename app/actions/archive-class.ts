"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function setClassArchived(classId: string, archived: boolean) {
  try {
    if (!classId) throw new Error("Class ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");
    if (cls.instructorId !== user.id) {
      throw new Error("Unauthorized: Only the class's instructor can archive it");
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: { archived },
    });

    return { success: true, class: updated };
  } catch (err) {
    console.error(`Failed to ${archived ? "archive" : "unarchive"} class:`, err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function archiveClass(classId: string) {
  return setClassArchived(classId, true);
}

export async function unarchiveClass(classId: string) {
  return setClassArchived(classId, false);
}
