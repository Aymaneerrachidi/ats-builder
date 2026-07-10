import type { ZodType } from "zod";
import { z } from "zod";

/**
 * Cohere's structured-output JSON Schema support rejects several standard
 * keywords zod emits by default: `minLength`/`maxLength`, `minItems`/
 * `maxItems`, `minimum`/`maximum`, `additionalProperties`, `uniqueItems`,
 * and schema-composition keywords (`anyOf`/`allOf`/`oneOf`/`not`). It also
 * only accepts `format: "date-time" | "uuid" | "date" | "time"`.
 * See https://docs.cohere.com/docs/structured-outputs.
 */
const UNSUPPORTED_KEYWORDS = new Set([
  "$schema",
  "additionalProperties",
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "uniqueItems",
  "anyOf",
  "allOf",
  "oneOf",
  "not",
]);

const ALLOWED_FORMATS = new Set(["date-time", "uuid", "date", "time"]);

function stripUnsupported(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(stripUnsupported);
  }
  if (node && typeof node === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (UNSUPPORTED_KEYWORDS.has(key)) continue;
      if (key === "format" && !ALLOWED_FORMATS.has(value as string)) continue;
      result[key] = stripUnsupported(value);
    }
    return result;
  }
  return node;
}

/** Converts a zod schema to a JSON Schema object compatible with Cohere's
 * `responseFormat: { type: "json_object", jsonSchema }` structured-output
 * mode (stricter than plain JSON Schema — see `UNSUPPORTED_KEYWORDS`). */
export function toCohereJsonSchema(schema: ZodType): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" });
  return stripUnsupported(jsonSchema) as Record<string, unknown>;
}
