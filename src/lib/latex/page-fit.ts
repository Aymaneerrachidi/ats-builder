import { COMPRESSION_LEVELS } from "@/lib/latex/compression";
import { compileLatexToPdf } from "@/lib/latex/compile";
import { renderResumeToLatex } from "@/lib/latex/render";
import { LatexCompilationError } from "@/lib/errors";
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

async function compileLocally(
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

interface RemoteCompileResponse {
  pdfBase64: string;
  tex: string;
  pageCount: number;
  fitsOnePage: boolean;
}

/** Vercel's serverless functions can't run xelatex (no TeX Live install fits
 * in a function bundle), so production compiles happen on a separate
 * always-on service instead — see /latex-service. Local development (no
 * LATEX_SERVICE_URL set) still compiles with a local xelatex install. */
async function compileRemotely(
  content: ResumeContent,
  templateId: ResumeTemplateId,
  onePage: boolean,
  serviceUrl: string
): Promise<PageFitResult> {
  const response = await fetch(`${serviceUrl.replace(/\/$/, "")}/compile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.LATEX_SERVICE_SECRET ?? "",
    },
    body: JSON.stringify({ content, templateId, onePage }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let message = `LaTeX compile service returned ${response.status}.`;
    try {
      const parsed = JSON.parse(body) as { error?: string };
      if (parsed.error) message = parsed.error;
    } catch {
      // body wasn't JSON — fall back to the generic message above
    }
    throw new LatexCompilationError(message, body);
  }

  const data = (await response.json()) as RemoteCompileResponse;
  return {
    pdf: Buffer.from(data.pdfBase64, "base64"),
    tex: data.tex,
    pageCount: data.pageCount,
    fitsOnePage: data.fitsOnePage,
  };
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
  const serviceUrl = process.env.LATEX_SERVICE_URL?.trim();
  if (serviceUrl) {
    return compileRemotely(content, templateId, onePage, serviceUrl);
  }
  return compileLocally(content, templateId, onePage);
}
