import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AIConfigError, AIResponseError } from "@/lib/ai/client";
import { AIEnhancementError } from "@/lib/ai/enhance";
import { AIExtractionError } from "@/lib/ai/extract";
import { AIJobTailoringError } from "@/lib/ai/job-tailor";
import { AIScoringError } from "@/lib/ai/ats-score";
import { LatexCompilationError, LatexEngineNotFoundError } from "@/lib/latex/compile";
import { LatexTemplateError } from "@/lib/latex/render";
import { DocxParsingError } from "@/lib/parsing/docx";
import { PdfParsingError } from "@/lib/parsing/pdf";
import { PayloadTooLargeError } from "@/lib/request-size";
import { ResumeNotFoundError } from "@/lib/resume-access";
import { UnauthorizedError } from "@/lib/session";
import { UploadValidationError } from "@/lib/validation/upload";

/**
 * Maps known application errors to friendly HTTP responses. Route handlers
 * should wrap their body in try/catch and pipe unexpected errors through
 * this so failures (AI outages, missing pdflatex, bad uploads, validation)
 * always reach the client as readable JSON instead of a raw stack trace.
 */
export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ResumeNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof PayloadTooLargeError) {
    return NextResponse.json({ error: error.message }, { status: 413 });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid request data.", details: error.flatten() },
      { status: 400 }
    );
  }
  if (
    error instanceof UploadValidationError ||
    error instanceof PdfParsingError ||
    error instanceof DocxParsingError ||
    error instanceof LatexTemplateError
  ) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof AIConfigError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  if (
    error instanceof AIExtractionError ||
    error instanceof AIEnhancementError ||
    error instanceof AIScoringError ||
    error instanceof AIJobTailoringError ||
    error instanceof AIResponseError
  ) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
  if (error instanceof LatexEngineNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof LatexCompilationError) {
    return NextResponse.json(
      { error: `We couldn't compile this resume to PDF: ${error.message}` },
      { status: 422 }
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}
