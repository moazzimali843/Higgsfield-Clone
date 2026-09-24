import type { LibraryGeneration } from "@/lib/generation-types";

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
