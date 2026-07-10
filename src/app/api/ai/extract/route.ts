import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { toErrorResponse } from "@/lib/api-error";
import { extractResumeFromText } from "@/lib/ai/extract";
import { assertReasonableBodySize } from "@/lib/request-size";
import { requireSession } from "@/lib/session";
import { isLikelyLinkedInUrl, LINKEDIN_URL_NOTICE } from "@/lib/validation/linkedin";

const extractRequestSchema = z.object({
  text: z.string().trim().min(1).max(50_000),
});

export async function POST(request: NextRequest) {
  try {
    await requireSession();
    assertReasonableBodySize(request);
    const { text } = extractRequestSchema.parse(await request.json());

    // Defense in depth: the builder UI intercepts LinkedIn URLs before ever
    // calling this endpoint, but never attempt to treat one as free text.
    if (isLikelyLinkedInUrl(text) && text.length < 300) {
      return NextResponse.json({ error: LINKEDIN_URL_NOTICE }, { status: 400 });
    }

    const content = await extractResumeFromText(text);
    return NextResponse.json({ content });
  } catch (error) {
    return toErrorResponse(error);
  }
}
