import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-error";
import { getOwnedResume } from "@/lib/resume-access";
import { resumeContentSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const resume = await getOwnedResume(id, session.user.id);
    const content = resumeContentSchema.parse(resume.content);
    const filename = `${resume.title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "resume"}.json`;

    return new NextResponse(JSON.stringify(content, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
