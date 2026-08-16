"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createClass(name: string) {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Class name cannot be empty");
    }

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

    if (!dbUser || dbUser.role !== "instructor" || dbUser.approvalStatus !== "approved") {
      throw new Error("Unauthorized: Only approved instructors can create classes");
    }

    let joinCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      joinCode = generateCode();
      const existingClass = await prisma.class.findUnique({
        where: { joinCode },
      });
      if (!existingClass) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new Error("Failed to generate a unique join code. Please try again.");
    }

    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        instructorId: user.id,
        joinCode,
      },
    });

    return { success: true, class: newClass };
  } catch (err) {
    console.error("Failed to create class:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
