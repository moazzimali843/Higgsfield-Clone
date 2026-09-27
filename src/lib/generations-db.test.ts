import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LibraryGeneration } from "@/lib/generation-types";
import {
  filterImportableGenerations,
  isShowcaseGenerationId,
  isValidUuid,
  libraryGenerationToRow,
  normalizeAspectRatio,
  parseLibraryGenerationBody,
  rowToLibraryGeneration,
} from "@/lib/generations-db";

const sampleRow = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  user_id: "660e8400-e29b-41d4-a716-446655440001",
  created_at: "2026-01-01T00:00:00.000Z",
  source: "demo" as const,
  media_type: "image" as const,
  output_url: "https://example.com/out.jpg",
  prompt: "hello",
  aspect_ratio: "16:9",
  model_id: "demo",
  effect_preset_id: null,
  reference_file_name: null,
  higgsfield_request_id: null,
  job_meta: null,
};

describe("generations-db mapping", () => {
  it("round-trips rows to library generations", () => {
    const gen = rowToLibraryGeneration(sampleRow);
    assert.equal(gen.id, sampleRow.id);
    assert.equal(gen.recipe.aspectRatio, "16:9");
    const row = libraryGenerationToRow(sampleRow.user_id, gen);
    assert.equal(row.user_id, sampleRow.user_id);
    assert.equal(row.output_url, sampleRow.output_url);
  });

  it("normalizes unknown aspect ratios to 1:1", () => {
    assert.equal(normalizeAspectRatio("2:3"), "1:1");
    assert.equal(normalizeAspectRatio("9:16"), "9:16");
  });

  it("validates UUIDs and showcase ids", () => {
    assert.equal(isValidUuid(sampleRow.id), true);
    assert.equal(isValidUuid("not-a-uuid"), false);
    assert.equal(isShowcaseGenerationId("showcase-abc"), true);
    assert.equal(isShowcaseGenerationId(sampleRow.id), false);
  });

  it("parses POST bodies and rejects showcase ids", () => {
    const body = {
      id: sampleRow.id,
      source: "demo",
      mediaType: "image",
      outputUrl: "https://example.com/a.jpg",
      recipe: {
        prompt: "p",
        aspectRatio: "1:1",
        modelId: "demo",
      },
    };
    const parsed = parseLibraryGenerationBody(body);
    assert.equal(parsed.ok, true);

    const bad = parseLibraryGenerationBody({
      ...body,
      id: "showcase-xyz",
    });
    assert.equal(bad.ok, false);
  });

  it("filters showcase rows from import", () => {
    const items: LibraryGeneration[] = [
      {
        id: "showcase-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        source: "demo",
        mediaType: "image",
        outputUrl: "https://images.pexels.com/1.jpg",
        recipe: { prompt: "x", aspectRatio: "1:1", modelId: "demo" },
      },
      {
        id: sampleRow.id,
        createdAt: "2026-01-01T00:00:00.000Z",
        source: "demo",
        mediaType: "image",
        outputUrl: "https://example.com/saved.jpg",
        recipe: { prompt: "y", aspectRatio: "1:1", modelId: "demo" },
      },
    ];
    const filtered = filterImportableGenerations(items);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.id, sampleRow.id);
  });
});
