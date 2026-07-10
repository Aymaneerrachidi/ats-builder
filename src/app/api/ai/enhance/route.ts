import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/api-error";
import { enhanceResume } from "@/lib/ai/enhance";
import { enhancementActionSchema } from "@/lib/ai/schemas";
import { assertReasonableBodySize } from "@/lib/request-size";
import { resumeContentSchema } from "@/lib/schema/resume";
import { requireSession } from "@/lib/session";

const enhanceRequestSchema = z.object({
  content: resumeContentSchema,
  action: enhancementActionSchema,
});

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    assertReasonableBodySize(request);
    const { content, action } = enhanceRequestSchema.parse(await request.json());

    const updated = await enhanceResume(content, action);
    return NextResponse.json({ content: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}
