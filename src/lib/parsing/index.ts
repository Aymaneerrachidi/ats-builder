import { extractTextFromDocx } from "@/lib/parsing/docx";
import { extractTextFromPdf } from "@/lib/parsing/pdf";
import { validateResumeUpload } from "@/lib/validation/upload";

export { PdfParsingError } from "@/lib/parsing/pdf";
export { DocxParsingError } from "@/lib/parsing/docx";

/** Validates and extracts raw text from an uploaded resume or LinkedIn PDF
 * export. This is the single entry point file uploads go through before
 * their content ever reaches the AI extraction layer. */
export async function parseUploadedFile(file: File): Promise<string> {
  validateResumeUpload(file);

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return extractTextFromPdf(buffer);
  }
  if (extension === "docx") {
    return extractTextFromDocx(buffer);
  }

  // validateResumeUpload already rejects any other extension.
  throw new Error(`Unsupported file extension: ${extension}`);
}
