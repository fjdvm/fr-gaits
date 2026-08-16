"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";

const API_KEY_SETTINGS = {
  GROQ_API_KEY: { label: "Groq API Key", provider: "groq" },
  GOOGLE_GENERATIVE_AI_API_KEY: {
    label: "Google AI API Key",
    provider: "google",
  },
} as const;

type ApiKeyName = keyof typeof API_KEY_SETTINGS;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "admin") throw new Error("Forbidden");

  return dbUser;
}

export async function getAdminApiKeyStatus(): Promise<
  { key: ApiKeyName; label: string; hasValue: boolean; updatedAt: string | null }[]
> {
  await requireAdmin();

  const settings = await prisma.systemSetting.findMany({
    where: { key: { in: Object.keys(API_KEY_SETTINGS) } },
  });

  const settingsMap = new Map(settings.map((s) => [s.key, s]));

  return Object.entries(API_KEY_SETTINGS).map(([key, meta]) => {
    const setting = settingsMap.get(key);
    return {
      key: key as ApiKeyName,
      label: meta.label,
      hasValue: !!setting?.value,
      updatedAt: setting?.updatedAt?.toISOString() ?? null,
    };
  });
}

export async function saveAdminApiKey(keyName: string, apiKey: string) {
  try {
    await requireAdmin();

    if (!Object.keys(API_KEY_SETTINGS).includes(keyName)) {
      return { success: false, error: "Invalid key name" };
    }

    if (!apiKey || apiKey.trim() === "") {
      return { success: false, error: "API key cannot be empty" };
    }

    const encryptedValue = encrypt(apiKey.trim());

    await prisma.systemSetting.upsert({
      where: { key: keyName },
      update: { value: encryptedValue },
      create: { key: keyName, value: encryptedValue },
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function removeAdminApiKey(keyName: string) {
  try {
    await requireAdmin();

    if (!Object.keys(API_KEY_SETTINGS).includes(keyName)) {
      return { success: false, error: "Invalid key name" };
    }

    await prisma.systemSetting.delete({ where: { key: keyName } }).catch(() => {
      // Key doesn't exist, that's fine
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function getDecryptedAdminApiKey(
  keyName: string
): Promise<string | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: keyName },
  });
  if (!setting?.value) return null;

  try {
    return decrypt(setting.value);
  } catch {
    return null;
  }
}
