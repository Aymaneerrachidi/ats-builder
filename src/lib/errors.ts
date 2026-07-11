/**
 * Every custom error class used across the app, defined in one file with
 * zero external imports. This matters: `src/lib/api-error.ts` needs these
 * classes for `instanceof` checks, but it's imported by every API route —
 * if it imported these classes from their "natural" home (e.g.
 * `PdfParsingError` from `@/lib/parsing/pdf.ts`, which top-level `import`s
 * `pdf-parse`), then a bundling/runtime problem in *any* one heavy
 * dependency (the Cohere SDK, pdf-parse, mammoth, Handlebars, ...) would
 * crash *every* route, including ones that never touch that dependency —
 * which is exactly what happened once in production. Each error class's
 * "home" module re-exports it from here instead of defining it locally, so
 * importing an error type never pulls in the library that throws it.
 *
 * Every class sets `this.name` explicitly (not relying on `constructor.name`)
 * because production minification can rename classes, which would silently
 * break any name-based error identification.
 */

export class AIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigError";
  }
}

export class AIResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIResponseError";
  }
}

export class AIExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIExtractionError";
  }
}

export class AIEnhancementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIEnhancementError";
  }
}

export class AIScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIScoringError";
  }
}

export class AIJobTailoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIJobTailoringError";
  }
}

export class LatexCompilationError extends Error {
  constructor(
    message: string,
    public readonly log: string
  ) {
    super(message);
    this.name = "LatexCompilationError";
  }
}

export class LatexEngineNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LatexEngineNotFoundError";
  }
}

export class LatexTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LatexTemplateError";
  }
}

export class PdfParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfParsingError";
  }
}

export class DocxParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocxParsingError";
  }
}

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export class PayloadTooLargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PayloadTooLargeError";
  }
}

export class ResumeNotFoundError extends Error {
  constructor() {
    super("Resume not found.");
    this.name = "ResumeNotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in to do this.");
    this.name = "UnauthorizedError";
  }
}
