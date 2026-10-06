import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { IMAGE_CONTENT_TYPES, type ImageKind } from "@/lib/image-upload";

/* Media storage (plan decision #5). V1 is local disk under
 * learning-management/storage/media — gitignored, outside public/, so
 * nothing is reachable by URL except through the authenticated route that
 * checks the program role first. A cloud backend (S3/Azure Blob) later
 * implements the same interface.
 *
 * Keys are generated here (random UUID + the extension the content check
 * decided) and are re-validated before every filesystem call, so a key can
 * never name a path outside the media directory. */

export interface MediaStorage {
  put(bytes: Uint8Array, kind: ImageKind): Promise<string>;
  get(key: string): Promise<{ bytes: Buffer; contentType: string } | null>;
  delete(key: string): Promise<void>;
}

const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg)$/;

export function isValidMediaKey(key: string): boolean {
  return KEY_PATTERN.test(key);
}

function localDiskStorage(root: string): MediaStorage {
  const fileFor = (key: string) => {
    if (!isValidMediaKey(key)) throw new Error("Invalid media key");
    return path.join(root, key);
  };

  return {
    async put(bytes, kind) {
      await mkdir(root, { recursive: true });
      const key = `${randomUUID()}.${kind}`;
      // "wx": never overwrite an existing file.
      await writeFile(fileFor(key), bytes, { flag: "wx" });
      return key;
    },
    async get(key) {
      if (!isValidMediaKey(key)) return null;
      try {
        const bytes = await readFile(fileFor(key));
        const kind = key.endsWith(".png") ? "png" : "jpg";
        return { bytes, contentType: IMAGE_CONTENT_TYPES[kind] };
      } catch {
        return null;
      }
    },
    async delete(key) {
      if (!isValidMediaKey(key)) return;
      await unlink(fileFor(key)).catch(() => undefined);
    },
  };
}

export const mediaStorage: MediaStorage = localDiskStorage(path.join(process.cwd(), "storage", "media"));
