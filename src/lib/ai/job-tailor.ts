import { AIConfigError, runStructuredChat } from "@/lib/ai/client";
import { buildJobTailoringPrompt, JOB_TAILORING_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { jobTailoringResultSchema, type JobTailoringResult } from "@/lib/ai/schemas";
import { AIJobTailoringError } from "@/lib/errors";
import type { ResumeContent } from "@/lib/schema/resume";

export { AIJobTailoringError };

export async function tailorResumeToJob(
  content: ResumeContent,
  jobDescription: string
): Promise<JobTailoringResult> {
  const trimmed = jobDescription.trim();
  if (!trimmed) {
    throw new AIJobTailoringError("No job description provided.");
  }

  try {
    return await runStructuredChat({
      schema: jobTailoringResultSchema,
      schemaName: "job_tailoring",
      systemPrompt: JOB_TAILORING_SYSTEM_PROMPT,
      userPrompt: buildJobTailoringPrompt(JSON.stringify(content), trimmed),
      temperature: 0.2,
    });
  } catch (error) {
    if (error instanceof AIConfigError) throw error;
    throw new AIJobTailoringError(
      `The AI did not return a job-tailoring analysis (${error instanceof Error ? error.message : "unknown error"}).`
    );
  }
}
