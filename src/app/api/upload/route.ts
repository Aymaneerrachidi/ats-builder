import { NextRequest, NextResponse } from "next/server";

import { toErrorResponse } from "@/lib/api-error";
import { parseUploadedFile } from "@/lib/parsing";
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

    const text = await parseUploadedFile(file);
    return NextResponse.json({ text });
  } catch (error) {
    return toErrorResponse(error);
  }
}
