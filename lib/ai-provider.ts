import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";
import { decrypt } from "./encryption";
import { prisma } from "./prisma";

type Provider = "groq" | "openai" | "anthropic" | "google";

const DEFAULT_MODELS: Record<Provider, string> = {
  groq: "openai/gpt-oss-120b",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-20241022",
  google: "gemini-1.5-flash",
};

function createModel(provider: Provider, apiKey: string, model?: string): LanguageModel {
  const modelId = model || DEFAULT_MODELS[provider];
  switch (provider) {
    case "groq":
      return createGroq({ apiKey })(modelId);
    case "openai":
      return createOpenAI({ apiKey })(modelId);
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

async function getDefaultModel(): Promise<LanguageModel> {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return createModel("groq", groqKey);
  }
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (googleKey) {
    return createModel("google", googleKey);
  }

  const adminKeys = await prisma.systemSetting.findMany({
    where: { key: { in: ["GROQ_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"] } },
  });

  for (const setting of adminKeys) {
    try {
      const decryptedKey = decrypt(setting.value);
      const provider = setting.key === "GROQ_API_KEY" ? "groq" : "google";
      return createModel(provider, decryptedKey);
    } catch {
      continue;
    }
  }

  throw new Error(
    "No AI API key configured. Set env vars or configure keys in admin settings."
  );
}

export async function getModelWithFallback(assignmentId: string): Promise<LanguageModel> {
  const assignmentClass = await prisma.assignmentClass.findFirst({
    where: { assignmentId },
    include: { class: { select: { aiProvider: true, aiApiKeyEnc: true } } },
  });

  if (assignmentClass?.class.aiProvider && assignmentClass.class.aiApiKeyEnc) {
    try {
      const decryptedKey = decrypt(assignmentClass.class.aiApiKeyEnc);
      return createModel(assignmentClass.class.aiProvider as Provider, decryptedKey);
    } catch {
    }
  }

  return getDefaultModel();
}

export async function streamWithFallback(
  assignmentId: string,
  streamFn: (model: LanguageModel) => Promise<any>
): Promise<any> {
  const assignmentClass = await prisma.assignmentClass.findFirst({
    where: { assignmentId },
    include: { class: { select: { aiProvider: true, aiApiKeyEnc: true } } },
  });

  if (assignmentClass?.class.aiProvider && assignmentClass.class.aiApiKeyEnc) {
    try {
      const decryptedKey = decrypt(assignmentClass.class.aiApiKeyEnc);
      const instructorModel = createModel(assignmentClass.class.aiProvider as Provider, decryptedKey);
      return await streamFn(instructorModel);
    } catch {
    }
  }

  const defaultModel = await getDefaultModel();
  return await streamFn(defaultModel);
}
