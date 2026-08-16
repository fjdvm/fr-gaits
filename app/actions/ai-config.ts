"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encryption";

export async function updateClassAiConfig(
  classId: string,
  provider: string,
  apiKey: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");
    if (cls.instructorId !== user.id) throw new Error("Not your class");

    const validProviders = ["groq", "openai", "anthropic", "google"];
    if (!validProviders.includes(provider)) {
      throw new Error(`Invalid provider. Must be one of: ${validProviders.join(", ")}`);
    }

    const encryptedKey = encrypt(apiKey);

    await prisma.class.update({
      where: { id: classId },
      data: { aiProvider: provider, aiApiKeyEnc: encryptedKey },
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function removeClassAiConfig(classId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new Error("Class not found");
    if (cls.instructorId !== user.id) throw new Error("Not your class");

    await prisma.class.update({
      where: { id: classId },
      data: { aiProvider: null, aiApiKeyEnc: null },
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
