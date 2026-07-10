import { createHash } from "node:crypto";

import type { ResumeContent, ResumeTemplateId } from "@/lib/schema/resume";

/** Deterministic cache key for a compiled PDF, derived from exactly the
 * inputs that affect its bytes (content + template + one-page lock). Used
 * to avoid re-spawning the LaTeX engine when the live preview re-requests
 * an export for content that hasn't changed since the last compile. */
export function resumeCompileCacheKey(
  resumeId: string,
  content: ResumeContent,
  template: ResumeTemplateId,
  onePage: boolean
): string {
  const hash = createHash("sha256")
    .update(template)
    .update(onePage ? "1" : "0")
    .update(JSON.stringify(content))
    .digest("hex")
    .slice(0, 24);
  return `resumes/${resumeId}/${hash}.pdf`;
}
