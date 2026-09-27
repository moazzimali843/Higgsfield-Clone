import type { LibraryGeneration } from "@/lib/generation-types";
import {
  aspectRatioOptions,
  type AspectRatio,
} from "@/lib/studio-recipe";
import { LIBRARY_MAX_ITEMS } from "@/lib/studio-library";

export type GenerationRow = {
  id: string;
  user_id: string;
  created_at: string;
  source: "demo" | "higgsfield";
  media_type: "image" | "video";
  output_url: string;
  prompt: string;
  aspect_ratio: string;
  model_id: string;
  effect_preset_id: string | null;
  reference_file_name: string | null;
  higgsfield_request_id: string | null;
  job_meta: Record<string, unknown> | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isShowcaseGenerationId(id: string): boolean {
  return id.startsWith("showcase-");
}

export function normalizeAspectRatio(value: string): AspectRatio {
  if (
    (aspectRatioOptions as readonly string[]).includes(value)
  ) {
    return value as AspectRatio;
  }
  return "1:1";
}

export function rowToLibraryGeneration(row: GenerationRow): LibraryGeneration {
  return {
    id: row.id,
    createdAt: row.created_at,
    source: row.source,
    mediaType: row.media_type,
    outputUrl: row.output_url,
    recipe: {
      prompt: row.prompt,
      aspectRatio: normalizeAspectRatio(row.aspect_ratio),
      modelId: row.model_id,
      ...(row.effect_preset_id
        ? { effectPresetId: row.effect_preset_id }
        : {}),
      ...(row.reference_file_name
        ? { referenceFileName: row.reference_file_name }
        : {}),
    },
  };
}

export type LibraryGenerationInsert = {
  id?: string;
  source: LibraryGeneration["source"];
  mediaType: LibraryGeneration["mediaType"];
  outputUrl: string;
  recipe: LibraryGeneration["recipe"];
  higgsfieldRequestId?: string;
  jobMeta?: Record<string, unknown>;
};

export function libraryGenerationToRow(
  userId: string,
  item: LibraryGenerationInsert,
): Omit<GenerationRow, "created_at"> {
  const id =
    item.id && isValidUuid(item.id) ? item.id : crypto.randomUUID();
  return {
    id,
    user_id: userId,
    source: item.source,
    media_type: item.mediaType,
    output_url: item.outputUrl.slice(0, 4096),
    prompt: item.recipe.prompt,
    aspect_ratio: normalizeAspectRatio(item.recipe.aspectRatio),
    model_id: item.recipe.modelId,
    effect_preset_id: item.recipe.effectPresetId ?? null,
    reference_file_name: item.recipe.referenceFileName ?? null,
    higgsfield_request_id: item.higgsfieldRequestId ?? null,
    job_meta: item.jobMeta ?? null,
  };
}

export type ParseLibraryBodyResult =
  | { ok: true; value: LibraryGenerationInsert }
  | { ok: false; error: string };

export function parseLibraryGenerationBody(
  body: unknown,
): ParseLibraryBodyResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body." };
  }
  const record = body as Record<string, unknown>;
  if (record.source !== "demo" && record.source !== "higgsfield") {
    return { ok: false, error: "Invalid source." };
  }
  if (record.mediaType !== "image" && record.mediaType !== "video") {
    return { ok: false, error: "Invalid mediaType." };
  }
  if (typeof record.outputUrl !== "string" || record.outputUrl.length === 0) {
    return { ok: false, error: "Missing outputUrl." };
  }
  if (record.outputUrl.length > 4096) {
    return { ok: false, error: "outputUrl too long." };
  }
  const recipe = record.recipe;
  if (!recipe || typeof recipe !== "object") {
    return { ok: false, error: "Missing recipe." };
  }
  const r = recipe as Record<string, unknown>;
  if (typeof r.prompt !== "string" || r.prompt.length === 0) {
    return { ok: false, error: "Missing prompt." };
  }
  if (typeof r.modelId !== "string" || r.modelId.length === 0) {
    return { ok: false, error: "Missing modelId." };
  }
  const aspectRatio =
    typeof r.aspectRatio === "string"
      ? normalizeAspectRatio(r.aspectRatio)
      : "1:1";

  let id: string | undefined;
  if (typeof record.id === "string") {
    if (isShowcaseGenerationId(record.id)) {
      return { ok: false, error: "Showcase ids cannot be stored." };
    }
    if (!isValidUuid(record.id)) {
      return { ok: false, error: "Invalid id." };
    }
    id = record.id;
  }

  return {
    ok: true,
    value: {
      id,
      source: record.source,
      mediaType: record.mediaType,
      outputUrl: record.outputUrl,
      recipe: {
        prompt: r.prompt,
        aspectRatio,
        modelId: r.modelId,
        ...(typeof r.effectPresetId === "string"
          ? { effectPresetId: r.effectPresetId }
          : {}),
        ...(typeof r.referenceFileName === "string"
          ? { referenceFileName: r.referenceFileName }
          : {}),
      },
    },
  };
}

export function filterImportableGenerations(
  items: LibraryGeneration[],
): LibraryGeneration[] {
  return items.filter(
    (item) =>
      !isShowcaseGenerationId(item.id) &&
      typeof item.outputUrl === "string" &&
      item.outputUrl.length > 0,
  );
}

export function assignImportIds(items: LibraryGeneration[]): LibraryGeneration[] {
  return items.map((item) => ({
    ...item,
    id: isValidUuid(item.id) ? item.id : crypto.randomUUID(),
  }));
}

export { LIBRARY_MAX_ITEMS };
