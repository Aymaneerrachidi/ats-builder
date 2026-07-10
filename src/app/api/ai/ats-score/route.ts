import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/api-error";
import { scoreResumeForATS } from "@/lib/ai/ats-score";
import { assertReasonableBodySize } from "@/lib/request-size";
import { resumeContentSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";

const atsScoreRequestSchema = z.object({
  content: resumeContentSchema,
});

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    assertReasonableBodySize(request);
    const { content } = atsScoreRequestSchema.parse(await request.json());

    const result = await scoreResumeForATS(content);
    return NextResponse.json({ result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
