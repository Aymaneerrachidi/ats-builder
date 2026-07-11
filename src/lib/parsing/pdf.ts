import { PDFParse } from "pdf-parse";

import { PdfParsingError } from "@/lib/errors";

export { PdfParsingError };

const PDF_MAGIC = Buffer.from("%PDF-", "ascii");

/** Extracts plain text from a PDF buffer. Verifies the file signature
 * (magic bytes) rather than trusting the client-supplied extension/MIME
 * type, since both are trivially spoofable. */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
    throw new PdfParsingError("This file does not look like a valid PDF.");
  }

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = result.text?.trim();
    if (!text) {
      throw new PdfParsingError(
        "No extractable text was found in this PDF. It may be a scanned image without OCR text."
      );
    }
    return text;
  } catch (error) {
    if (error instanceof PdfParsingError) throw error;
    throw new PdfParsingError(
      `Could not read this PDF (${error instanceof Error ? error.message : "unknown error"}).`
    );
  } finally {
    await parser.destroy();
  }
}
