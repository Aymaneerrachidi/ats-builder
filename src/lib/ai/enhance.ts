import { AIConfigError, runStructuredChat } from "@/lib/ai/client";
import { buildEnhancementPrompt, RESUME_JSON_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { EnhancementAction } from "@/lib/ai/schemas";
import { resumeContentSchema, type ResumeContent } from "@/lib/schema/resume";

export class AIEnhancementError extends Error {}

/** Applies a single named enhancement (e.g. "improve_summary") to a resume
 * and returns the full, updated resume JSON. */
export async function enhanceResume(
  content: ResumeContent,
  action: EnhancementAction
): Promise<ResumeContent> {
  try {
    return await runStructuredChat({
      schema: resumeContentSchema,
      schemaName: "resume",
      systemPrompt: RESUME_JSON_SYSTEM_PROMPT,
      userPrompt: buildEnhancementPrompt(action, JSON.stringify(content)),
      temperature: 0.4,
    });
  } catch (error) {
    if (error instanceof AIConfigError) throw error;
    throw new AIEnhancementError(
      `The AI did not return an updated resume (${error instanceof Error ? error.message : "unknown error"}).`
    );
  }
}
