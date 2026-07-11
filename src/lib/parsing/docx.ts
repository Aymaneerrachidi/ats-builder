import mammoth from "mammoth";

import { DocxParsingError } from "@/lib/errors";

export { DocxParsingError };

const ZIP_MAGIC = Buffer.from("PK", "ascii");

/** Extracts plain text from a .docx buffer. DOCX files are ZIP archives, so
 * we verify the ZIP signature before handing the buffer to mammoth rather
 * than trusting the client-supplied extension/MIME type. */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  if (!buffer.subarray(0, ZIP_MAGIC.length).equals(ZIP_MAGIC)) {
    throw new DocxParsingError("This file does not look like a valid DOCX document.");
  }

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim();
    if (!text) {
      throw new DocxParsingError("No extractable text was found in this document.");
    }
    return text;
  } catch (error) {
    if (error instanceof DocxParsingError) throw error;
    throw new DocxParsingError(
      `Could not read this DOCX file (${error instanceof Error ? error.message : "unknown error"}).`
    );
  }
}
