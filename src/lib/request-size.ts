import { NextRequest } from "next/server";

export class PayloadTooLargeError extends Error {}

const MAX_JSON_BODY_BYTES = 200 * 1024; // 200 KB — generous for resume JSON + pasted text

/** Rejects oversized JSON bodies before `request.json()` parses them, so a
 * malicious `Content-Length` can't force the server to buffer/parse an
 * arbitrarily large payload in memory. */
export function assertReasonableBodySize(
  request: NextRequest,
  maxBytes: number = MAX_JSON_BODY_BYTES
): void {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new PayloadTooLargeError(
      `Request body too large (max ${Math.floor(maxBytes / 1024)} KB).`
    );
  }
}
