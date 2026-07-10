import { z } from "zod";

/** Structured-output schema for the ATS scoring endpoint. */
export const atsScoreResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  categories: z.array(
    z.object({
      name: z.string().max(80),
      score: z.number().int().min(0).max(100),
      comment: z.string().max(300),
    })
  ),
  strengths: z.array(z.string().max(300)).max(10),
  warnings: z.array(z.string().max(300)).max(10),
  suggestions: z.array(z.string().max(300)).max(10),
});

export type AtsScoreResult = z.infer<typeof atsScoreResultSchema>;

/** Structured-output schema for job-description tailoring. Never fabricates
 * experience — bullet rewrites must only rephrase existing resume content. */
export const jobTailoringResultSchema = z.object({
  extractedKeywords: z.array(z.string().max(60)).max(40),
  matchedKeywords: z.array(z.string().max(60)).max(40),
  missingKeywords: z.array(z.string().max(60)).max(40),
  matchScore: z.number().int().min(0).max(100),
  suggestions: z.array(z.string().max(300)).max(15),
  rewrittenBullets: z.array(
    z.object({
      original: z.string().max(400),
      revised: z.string().max(400),
      reason: z.string().max(200),
    })
  ).max(20),
});

export type JobTailoringResult = z.infer<typeof jobTailoringResultSchema>;

export const ENHANCEMENT_ACTIONS = [
  "improve_summary",
  "improve_experience",
  "rewrite_bullets",
  "make_ats_friendly",
  "add_metrics",
  "shorten",
  "expand",
  "professional_tone",
  "technical_tone",
  "leadership_tone",
] as const;

export type EnhancementAction = (typeof ENHANCEMENT_ACTIONS)[number];

export const enhancementActionSchema = z.enum(ENHANCEMENT_ACTIONS);
