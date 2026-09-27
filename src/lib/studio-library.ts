import type { LibraryGeneration } from "@/lib/generation-types";
import {
  getLibraryCatalogGallery,
  showcaseIdForPreviewSrc,
  type PreviewMedia,
} from "@/lib/preview-media";

export const LIBRARY_STORAGE_KEY = "higgsfield-studio-library-v1";
export const LIBRARY_MAX_ITEMS = 48;

export function parseLibraryJson(raw: string | null): LibraryGeneration[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLibraryGeneration);
  } catch {
    return [];
  }
}

function isLibraryGeneration(value: unknown): value is LibraryGeneration {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.createdAt !== "string") {
    return false;
  }
  if (item.source !== "demo" && item.source !== "higgsfield") return false;
  if (item.mediaType !== "image" && item.mediaType !== "video") return false;
  if (typeof item.outputUrl !== "string") return false;
  const recipe = item.recipe;
  if (!recipe || typeof recipe !== "object") return false;
  const r = recipe as Record<string, unknown>;
  return (
    typeof r.prompt === "string" &&
    typeof r.aspectRatio === "string" &&
    typeof r.modelId === "string"
  );
}

export function serializeLibrary(items: LibraryGeneration[]): string {
  return JSON.stringify(items);
}

export function prependGeneration(
  items: LibraryGeneration[],
  generation: LibraryGeneration,
): LibraryGeneration[] {
  const next = [generation, ...items.filter((g) => g.id !== generation.id)];
  return next.slice(0, LIBRARY_MAX_ITEMS);
}

export function readLibraryFromStorage(
  storage: Pick<Storage, "getItem">,
): LibraryGeneration[] {
  return parseLibraryJson(storage.getItem(LIBRARY_STORAGE_KEY));
}

export function writeLibraryToStorage(
  storage: Pick<Storage, "setItem">,
  items: LibraryGeneration[],
): void {
  storage.setItem(LIBRARY_STORAGE_KEY, serializeLibrary(items));
}

export function findLibraryGenerationById(
  items: LibraryGeneration[],
  id: string,
): LibraryGeneration | undefined {
  return items.find((item) => item.id === id);
}

export function libraryGenerationFromPreviewMedia(
  media: PreviewMedia,
): LibraryGeneration {
  return {
    id: showcaseIdForPreviewSrc(media.src),
    createdAt: "1970-01-01T00:00:00.000Z",
    source: "demo",
    mediaType: media.type,
    outputUrl: media.src,
    recipe: {
      prompt: media.alt,
      aspectRatio: media.type === "video" ? "16:9" : "3:4",
      modelId: "demo",
    },
  };
}

export function getLibraryShowcaseGenerations(): LibraryGeneration[] {
  return getLibraryCatalogGallery().map(libraryGenerationFromPreviewMedia);
}

/** Saved browser library first, then image/video showcase items not already saved. */
export function mergeSavedLibraryWithShowcase(
  saved: LibraryGeneration[],
): LibraryGeneration[] {
  const savedUrls = new Set(saved.map((item) => item.outputUrl));
  const showcase = getLibraryShowcaseGenerations().filter(
    (item) => !savedUrls.has(item.outputUrl),
  );
  return [...saved, ...showcase];
}

export function libraryHrefForGeneration(generationId: string): string {
  return `/library/${encodeURIComponent(generationId)}`;
}

export function createLibraryGeneration(input: {
  mediaType?: LibraryGeneration["mediaType"];
  outputUrl: string;
  recipe: LibraryGeneration["recipe"];
  source?: LibraryGeneration["source"];
}): LibraryGeneration {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    source: input.source ?? "demo",
    mediaType: input.mediaType ?? "image",
    outputUrl: input.outputUrl,
    recipe: input.recipe,
  };
}
