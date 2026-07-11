import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-error";
import { requireSession } from "@/lib/session";
import { UploadValidationError } from "@/lib/validation/upload";

export async function POST(request: NextRequest) {
  try {
    await requireSession();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new UploadValidationError("No file was uploaded.");
    }

    // Imported dynamically (not at module top-level) so that a load-time
    // failure in pdf-parse/mammoth (both do Node-specific/dynamic-require
    // things that have misbehaved under bundling before) is caught below and
    // turned into a JSON error response, instead of crashing this route
    // before the try block even runs and falling through to Next's default
    // HTML error page.
    const { parseUploadedFile } = await import("@/lib/parsing");
    const text = await parseUploadedFile(file);
    return NextResponse.json({ text });
  } catch (error) {
    return toErrorResponse(error);
  }
}
