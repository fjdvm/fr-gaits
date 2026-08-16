"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function joinClass(joinCode: string) {
  try {
    if (!joinCode || joinCode.trim() === "") {
      throw new Error("Join code cannot be empty");
    }

    const cleanCode = joinCode.trim().toUpperCase();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized: You must be logged in");
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || dbUser.role !== "student") {
      throw new Error("Unauthorized: Only students can join classes");
    }

    const targetClass = await prisma.class.findUnique({
      where: { joinCode: cleanCode },
    });

    if (!targetClass) {
      throw new Error("Invalid join code. Class not found.");
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId: user.id,
          classId: targetClass.id,
        },
      },
    });

    if (existingEnrollment) {
      throw new Error("You are already enrolled in this class");
    }

    await prisma.enrollment.create({
      data: {
        studentId: user.id,
        classId: targetClass.id,
      },
    });

    return { success: true, className: targetClass.name };
  } catch (err) {
    console.error("Failed to join class:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
