/* Image upload validation (SECURITY.md §10): the file's type is decided by
 * its content (magic bytes), never by its name or the browser-sent MIME
 * type, and the size is capped. Pure — unit-tested. */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export type ImageKind = "png" | "jpg";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return bytes.length >= signature.length && signature.every((b, i) => bytes[i] === b);
}

export function detectImageKind(bytes: Uint8Array): ImageKind | null {
  if (startsWith(bytes, PNG_SIGNATURE)) return "png";
  if (startsWith(bytes, JPEG_SIGNATURE)) return "jpg";
  return null;
}

export type ImageCheck = { ok: true; kind: ImageKind } | { ok: false; error: string };

export function checkImage(bytes: Uint8Array): ImageCheck {
  if (bytes.length === 0) return { ok: false, error: "Choose a PNG or JPG image." };
  if (bytes.length > MAX_IMAGE_BYTES) return { ok: false, error: "Images must be 2 MB or smaller." };
  const kind = detectImageKind(bytes);
  if (!kind) return { ok: false, error: "Only PNG or JPG images can be uploaded." };
  return { ok: true, kind };
}

export const IMAGE_CONTENT_TYPES: Record<ImageKind, string> = {
  png: "image/png",
  jpg: "image/jpeg",
};
