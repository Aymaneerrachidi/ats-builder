import { COMPRESSION_LEVELS } from "./compression";
import { compileLatexToPdf } from "./compile";
import { renderResumeToLatex } from "./render";
import type { ResumeContent, ResumeTemplateId } from "./schema";

/** Mirrors src/lib/latex/page-fit.ts in the main app verbatim. */

export interface PageFitResult {
  pdf: Buffer;
  tex: string;
  pageCount: number;
  fitsOnePage: boolean;
}

export async function compileResumeWithPageFit(
  content: ResumeContent,
  templateId: ResumeTemplateId,
  onePage: boolean
): Promise<PageFitResult> {
  if (!onePage) {
    const tex = await renderResumeToLatex(content, templateId, 0);
    const { pdf, pageCount } = await compileLatexToPdf(tex);
    return { pdf, tex, pageCount, fitsOnePage: true };
  }

  let last: { pdf: Buffer; tex: string; pageCount: number } | null = null;

  for (const level of COMPRESSION_LEVELS) {
    const tex = await renderResumeToLatex(content, templateId, level);
    const { pdf, pageCount } = await compileLatexToPdf(tex);
    last = { pdf, tex, pageCount };
    if (pageCount <= 1) {
      return { ...last, fitsOnePage: true };
    }
  }

  return { ...last!, fitsOnePage: false };
}
