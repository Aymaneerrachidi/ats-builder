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

/**
 * Returns the exact .tex source that produced (or would produce) the
 * current PDF export — including whatever compression level one-page mode
 * required — rather than always the uncompressed level-0 source, so the
 * downloads never disagree with each other.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const resume = await getOwnedResume(id, session.user.id);
    const content = resumeContentSchema.parse(resume.content);

    const cacheKey = resumeCompileCacheKey(resume.id, content, resume.template, resume.onePage);
    let tex: string;
    try {
      tex = (await storage.get(`${cacheKey}.tex`)).toString("utf-8");
    } catch {
      const result = await compileResumeWithPageFit(content, resume.template, resume.onePage);
      tex = result.tex;
      await storage.put(`${cacheKey}.tex`, Buffer.from(tex, "utf-8"));
    }

    const filename = `${resume.title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "resume"}.tex`;

    return new NextResponse(tex, {
      headers: {
        "Content-Type": "text/x-tex; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
