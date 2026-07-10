import { COMPRESSION_LEVELS } from "@/lib/latex/compression";
import { compileLatexToPdf } from "@/lib/latex/compile";
import { renderResumeToLatex } from "@/lib/latex/render";
import type { ResumeContent, ResumeTemplateId } from "@/lib/schema/resume";

export interface PageFitResult {
  pdf: Buffer;
  tex: string;
  pageCount: number;
  /** True if not locked to one page, or locked and it fit. False means even
   * the tightest layout still overflowed — the caller should prompt the
   * user to shorten content (e.g. the builder's "Shorten" AI action). */
  fitsOnePage: boolean;
}

/**
 * Compiles a resume, and when `onePage` is set, progressively tightens the
 * layout (smaller font, narrower margins, tighter spacing — see
 * compression.ts) and recompiles until it fits on a single page or the
 * tightest preset is exhausted. Never rewrites the user's content — that's
 * left to the user via the existing "Shorten" AI enhancement if even the
 * tightest layout doesn't fit.
 */
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

  // Exhausted every compression level and it still didn't fit — return the
  // tightest attempt so the user at least sees how close it got.
  return { ...last!, fitsOnePage: false };
}
