import fs from "node:fs/promises";
import path from "node:path";

/**
 * Minimal file storage abstraction. The local-disk implementation is used
 * in development; swap `storage` for an S3/R2/Blob-backed implementation of
 * the same interface for production without touching call sites.
 */
export interface Storage {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

const STORAGE_ROOT = path.resolve(process.env.STORAGE_DIR || "./storage");

function resolveKeyPath(key: string): string {
  // Prevent path traversal — keys must resolve inside STORAGE_ROOT.
  const resolved = path.resolve(STORAGE_ROOT, key);
  if (!resolved.startsWith(STORAGE_ROOT + path.sep) && resolved !== STORAGE_ROOT) {
    throw new Error(`Invalid storage key: "${key}"`);
  }
  return resolved;
}

class LocalStorage implements Storage {
  async put(key: string, data: Buffer): Promise<void> {
    const filePath = resolveKeyPath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(resolveKeyPath(key));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(resolveKeyPath(key), { force: true });
  }
}

export const storage: Storage = new LocalStorage();
