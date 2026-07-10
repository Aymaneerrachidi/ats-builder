import { CohereClientV2 } from "cohere-ai";
import type { ZodType, z } from "zod";

import { toCohereJsonSchema } from "@/lib/ai/schema-utils";

let cached: CohereClientV2 | null = null;

export class AIConfigError extends Error {}
export class AIResponseError extends Error {}

/** Lazily constructs the Cohere client so route handlers can surface a
 * friendly "AI is not configured" error instead of a boot-time crash when
 * COHERE_API_KEY is missing. */
export function getCohereClient(): CohereClientV2 {
  if (cached) return cached;

  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new AIConfigError(
      "COHERE_API_KEY is not set. Add it to your environment to enable AI features."
    );
  }

  cached = new CohereClientV2({ token: apiKey });
  return cached;
}

export const AI_MODEL = process.env.COHERE_MODEL || "command-a-03-2025";

interface StructuredChatOptions<Schema extends ZodType> {
  schema: Schema;
  schemaName: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}

/**
 * Runs a Cohere chat completion constrained to a JSON schema and validates
 * the result against the same zod schema (belt-and-suspenders — Cohere's
 * structured outputs are reliable but not infallible). Every AI feature in
 * this app goes through this single function, so "AI only ever outputs
 * schema-valid JSON" is enforced in exactly one place.
 */
export async function runStructuredChat<Schema extends ZodType>({
  schema,
  schemaName,
  systemPrompt,
  userPrompt,
  temperature = 0.3,
}: StructuredChatOptions<Schema>): Promise<z.infer<Schema>> {
  const client = getCohereClient();

  const response = await client.chat({
    model: AI_MODEL,
    temperature,
    messages: [
      {
        role: "system",
        content: `${systemPrompt}\n\nRespond with a single JSON object named "${schemaName}" matching the required schema. Output JSON only — no markdown, no commentary.`,
      },
      { role: "user", content: userPrompt },
    ],
    responseFormat: {
      type: "json_object",
      jsonSchema: toCohereJsonSchema(schema),
    },
  });

  const textContent = response.message.content?.find((item) => item.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new AIResponseError("The AI did not return a text response.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(textContent.text);
  } catch {
    throw new AIResponseError("The AI returned invalid JSON.");
  }

  return schema.parse(parsedJson);
}
