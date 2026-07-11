import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  AIConfigError,
  AIEnhancementError,
  AIExtractionError,
  AIJobTailoringError,
  AIResponseError,
  AIScoringError,
  DocxParsingError,
  LatexCompilationError,
  LatexEngineNotFoundError,
  LatexTemplateError,
  PayloadTooLargeError,
  PdfParsingError,
  ResumeNotFoundError,
  UnauthorizedError,
  UploadValidationError,
} from "@/lib/errors";

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
