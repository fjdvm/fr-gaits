"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function deleteClass(classId: string) {
  try {
    if (!classId) throw new Error("Class ID is required");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized: You must be logged in");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");
    if (cls.instructorId !== user.id) {
      throw new Error("Unauthorized: Only the class's instructor can delete it");
    }

    await prisma.class.delete({ where: { id: classId } });

    return { success: true };
  } catch (err) {
    console.error("Failed to delete class:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
