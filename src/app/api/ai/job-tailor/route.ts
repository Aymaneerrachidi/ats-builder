import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/api-error";
import { tailorResumeToJob } from "@/lib/ai/job-tailor";
import { assertReasonableBodySize } from "@/lib/request-size";
import { resumeContentSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";

const jobTailorRequestSchema = z.object({
  content: resumeContentSchema,
  jobDescription: z.string().trim().min(1).max(20_000),
});

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    assertReasonableBodySize(request);
    const { content, jobDescription } = jobTailorRequestSchema.parse(await request.json());

    const result = await tailorResumeToJob(content, jobDescription);
    return NextResponse.json({ result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
