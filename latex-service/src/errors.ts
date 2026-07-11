/** Mirrors the relevant subset of src/lib/errors.ts in the main app. */

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
