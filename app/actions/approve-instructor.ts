"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function approveInstructor(userId: string) {
  try {
    // 1. Update the public.users record
    await prisma.user.update({
      where: { id: userId },
      data: { approvalStatus: "approved" },
    });

    // 2. Update the Supabase Auth metadata to match
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { approval_status: "approved" },
    });

    if (error) {
      throw new Error(`Supabase Auth metadata update failed: ${error.message}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to approve instructor:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
