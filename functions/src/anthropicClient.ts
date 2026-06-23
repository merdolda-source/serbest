import Anthropic from "@anthropic-ai/sdk";
import { defineSecret } from "firebase-functions/params";

/**
 * Anthropic API anahtarı SADECE burada, Secret Manager üzerinden okunur.
 * Hiçbir client (Expo/React Native) kodu bu anahtara erişemez.
 * Kurulum: firebase functions:secrets:set ANTHROPIC_API_KEY
 */
export const anthropicApiKey = defineSecret("ANTHROPIC_API_KEY");

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: anthropicApiKey.value() });
  }
  return client;
}
