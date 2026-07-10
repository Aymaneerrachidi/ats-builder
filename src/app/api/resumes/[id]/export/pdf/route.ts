import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-error";
import { resumeCompileCacheKey } from "@/lib/latex/cache-key";
import { compileResumeWithPageFit } from "@/lib/latex/page-fit";
import { getOwnedResume } from "@/lib/resume-access";
import { resumeContentSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";
import { storage } from "@/lib/storage";

interface Params {
  params: Promise<{ id: string }>;
}

interface CachedMeta {
  pageCount: number;
  fitsOnePage: boolean;
}

/**
 * Compiles the resume's current, persisted content to a PDF and streams it
 * back. Used both for the live preview `<iframe>` (inline) and the
 * "Download PDF" button (`?download=1` → attachment), so preview and export
 * can never drift apart — there is exactly one compile path. When the
 * resume is locked to one page, `X-Page-Count` / `X-Fits-One-Page` report
 * whether the tightest layout actually got it onto a single page.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const resume = await getOwnedResume(id, session.user.id);
    const content = resumeContentSchema.parse(resume.content);

    const cacheKey = resumeCompileCacheKey(resume.id, content, resume.template, resume.onePage);
    const metaKey = `${cacheKey}.meta.json`;

    let pdf: Buffer;
    let meta: CachedMeta;
    try {
      pdf = await storage.get(cacheKey);
      meta = JSON.parse((await storage.get(metaKey)).toString("utf-8"));
    } catch {
      const result = await compileResumeWithPageFit(content, resume.template, resume.onePage);
      pdf = result.pdf;
      meta = { pageCount: result.pageCount, fitsOnePage: result.fitsOnePage };
      await storage.put(cacheKey, pdf);
      await storage.put(metaKey, Buffer.from(JSON.stringify(meta), "utf-8"));
      await storage.put(`${cacheKey}.tex`, Buffer.from(result.tex, "utf-8"));
    }

    const isDownload = request.nextUrl.searchParams.has("download");
    const filename = `${resume.title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "resume"}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Page-Count": String(meta.pageCount),
        "X-Fits-One-Page": String(meta.fitsOnePage),
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
