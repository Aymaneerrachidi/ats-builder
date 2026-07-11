import { AIConfigError, runStructuredChat } from "@/lib/ai/client";
import { buildExtractionPrompt, RESUME_JSON_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { AIExtractionError } from "@/lib/errors";
import { resumeContentSchema, type ResumeContent } from "@/lib/schema/resume";

export { AIExtractionError };

/** Turns raw, messy source text (pasted resume, LinkedIn PDF text, manual
 * notes) into structured resume JSON via a Cohere structured-output call. */
export async function extractResumeFromText(sourceText: string): Promise<ResumeContent> {
  const trimmed = sourceText.trim();
  if (!trimmed) {
    throw new AIExtractionError("No source content to extract from.");
  }

  try {
    return await runStructuredChat({
      schema: resumeContentSchema,
      schemaName: "resume",
      systemPrompt: RESUME_JSON_SYSTEM_PROMPT,
      userPrompt: buildExtractionPrompt(trimmed),
      temperature: 0.2,
    });
  } catch (error) {
    if (error instanceof AIConfigError) throw error;
    throw new AIExtractionError(
      `The AI did not return structured resume data (${error instanceof Error ? error.message : "unknown error"}).`
    );
  }
}
