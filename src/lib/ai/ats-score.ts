import { AIConfigError, runStructuredChat } from "@/lib/ai/client";
import { ATS_SCORE_SYSTEM_PROMPT, buildAtsScorePrompt } from "@/lib/ai/prompts";
import { atsScoreResultSchema, type AtsScoreResult } from "@/lib/ai/schemas";
import { AIScoringError } from "@/lib/errors";
import type { ResumeContent } from "@/lib/schema/resume";

export { AIScoringError };

export async function scoreResumeForATS(content: ResumeContent): Promise<AtsScoreResult> {
  try {
    return await runStructuredChat({
      schema: atsScoreResultSchema,
      schemaName: "ats_score",
      systemPrompt: ATS_SCORE_SYSTEM_PROMPT,
      userPrompt: buildAtsScorePrompt(JSON.stringify(content)),
      temperature: 0.2,
    });
  } catch (error) {
    if (error instanceof AIConfigError) throw error;
    throw new AIScoringError(
      `The AI did not return an ATS score (${error instanceof Error ? error.message : "unknown error"}).`
    );
  }
}
