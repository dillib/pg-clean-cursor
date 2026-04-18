/**
 * Central AI client — picks provider at startup from env and exports an
 * OpenAI-SDK-compatible client. All EU-sovereign providers (Mistral La
 * Plateforme, Scaleway Generative API, Azure OpenAI EU) expose an
 * OpenAI-compatible REST surface, so the same SDK works against any of them
 * with only baseURL / apiKey / model-name changes.
 *
 * To use Mistral La Plateforme (cheapest EU-sovereign path, no vendor lock-in):
 *   AI_PROVIDER=mistral
 *   AI_API_KEY=<from https://console.mistral.ai/>
 *
 * To use Scaleway (free tier: 1M tokens/month, FR-hosted):
 *   AI_PROVIDER=scaleway
 *   AI_API_KEY=<from Scaleway console>
 *
 * To keep OpenAI (current default — backwards-compatible):
 *   AI_PROVIDER=openai  (or leave unset)
 *   AI_INTEGRATIONS_OPENAI_API_KEY=<key>
 *
 * All model names are resolved from AI_CHAT_MODEL / AI_MINI_MODEL env with
 * provider-appropriate defaults — route code should import AI_CHAT_MODEL
 * rather than hardcode "gpt-4o".
 */
import OpenAI from "openai";

export type AIProvider = "openai" | "mistral" | "scaleway" | "azure-openai" | "custom";

interface ProviderDefaults {
  baseURL?: string;
  chat: string;
  mini: string;
}

const DEFAULTS: Record<AIProvider, ProviderDefaults> = {
  openai: {
    baseURL: undefined,
    chat: "gpt-4o",
    mini: "gpt-4o-mini",
  },
  mistral: {
    baseURL: "https://api.mistral.ai/v1",
    chat: "mistral-large-latest",
    mini: "mistral-small-latest",
  },
  scaleway: {
    // Scaleway exposes OpenAI-compatible /v1 chat completions.
    baseURL: "https://api.scaleway.ai/v1",
    chat: "llama-3.3-70b-instruct",
    mini: "llama-3.1-8b-instruct",
  },
  "azure-openai": {
    // Azure baseURL is deployment-specific — always override via AI_BASE_URL.
    baseURL: undefined,
    chat: "gpt-4o",
    mini: "gpt-4o-mini",
  },
  custom: {
    baseURL: undefined,
    chat: "custom-chat",
    mini: "custom-mini",
  },
};

export const AI_PROVIDER: AIProvider =
  (process.env.AI_PROVIDER as AIProvider | undefined) ?? "openai";

const defaults = DEFAULTS[AI_PROVIDER] ?? DEFAULTS.openai;

const apiKey =
  process.env.AI_API_KEY ??
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY ??
  "";

const baseURL =
  process.env.AI_BASE_URL ??
  defaults.baseURL ??
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

export const aiClient = new OpenAI({ apiKey, baseURL });

export const AI_CHAT_MODEL = process.env.AI_CHAT_MODEL ?? defaults.chat;
export const AI_MINI_MODEL = process.env.AI_MINI_MODEL ?? defaults.mini;

export function describeAIProvider(): string {
  return `${AI_PROVIDER} (chat=${AI_CHAT_MODEL}, mini=${AI_MINI_MODEL}${baseURL ? `, baseURL=${baseURL}` : ""})`;
}
