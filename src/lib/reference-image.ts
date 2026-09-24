const ACCEPTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Keeps multipart Soul submits under Vercel's 4.5 MB function body limit. */
export const REFERENCE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export const REFERENCE_IMAGE_MAX_LABEL = "4 MB";

export type ReferenceImageAttachment = {
  fileName: string;
  previewUrl: string;
};

export function validateReferenceImageFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!ACCEPTED_MIME.has(file.type)) {
    return {
      ok: false,
      error: "Use a JPEG, PNG, or WebP image for the reference.",
    };
  }
  if (file.size > REFERENCE_IMAGE_MAX_BYTES) {
    return {
      ok: false,
      error: `Reference image must be ${REFERENCE_IMAGE_MAX_LABEL} or smaller.`,
    };
  }
  return { ok: true };
}
