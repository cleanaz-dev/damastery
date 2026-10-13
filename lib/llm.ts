// lib/llm.ts
import OpenAI from "openai";

export const novita = new OpenAI({
  baseURL: "https://api.novita.ai/openai",
  apiKey: process.env.NOVITA_API_KEY,
});

export const LLM_MODELS = {
  GLM_FLASH_5_3: "zai-org/glm-5.3-flash",
  DEEPSEEK_FLASH_4_1: "deepseek/deepseek-v4.1-flash",
} as const;