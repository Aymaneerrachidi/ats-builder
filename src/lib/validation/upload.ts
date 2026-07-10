export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const ACCEPTED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
] as const;

export const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"] as const;

export class UploadValidationError extends Error {}

/** Validates an uploaded resume/LinkedIn-export file before it is ever
 * parsed: size limit, MIME type, and extension must all agree. This is a
 * security boundary — nothing derived from the raw bytes (parsing, AI
 * extraction) should run before this passes. */
export function validateResumeUpload(file: File): void {
  if (file.size === 0) {
    throw new UploadValidationError("The uploaded file is empty.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`
    );
  }

  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  if (!ACCEPTED_RESUME_EXTENSIONS.includes(extension as (typeof ACCEPTED_RESUME_EXTENSIONS)[number])) {
    throw new UploadValidationError(
      `Unsupported file extension "${extension}". Please upload a PDF or DOCX file.`
    );
  }

  if (
    file.type &&
    !ACCEPTED_RESUME_MIME_TYPES.includes(file.type as (typeof ACCEPTED_RESUME_MIME_TYPES)[number])
  ) {
    throw new UploadValidationError(
      `Unsupported file type "${file.type}". Please upload a PDF or DOCX file.`
    );
  }
}
