import { DemoBadge } from "@/components/DemoBadge";
import { getEffectPresetById } from "@/data/effect-presets";
import type { LibraryGeneration } from "@/lib/generation-types";
import { getComposerModelById } from "@/lib/studio-recipe";

type GenerationRecipePanelProps = {
  generation: LibraryGeneration;
  createdAtLabel?: string;
};

function formatSourceLabel(source: LibraryGeneration["source"]): string {
  switch (source) {
    case "demo":
      return "Demo sample";
    default:
      return source;
  }
}

export function GenerationRecipePanel({
  generation,
  createdAtLabel,
}: GenerationRecipePanelProps) {
  const { recipe, source } = generation;
  const model =
    getComposerModelById(recipe.modelId) ?? {
      id: recipe.modelId,
      label: recipe.modelId,
      description: "",
    };
  const effectPreset = recipe.effectPresetId
    ? getEffectPresetById(recipe.effectPresetId)
    : undefined;

  return (
    <dl className="flex flex-col gap-4 text-sm">
      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-studio-muted">
          Output
        </dt>
        <dd className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-studio-fg">{formatSourceLabel(source)}</span>
          {source === "demo" ? <DemoBadge /> : null}
        </dd>
      </div>

      <div>
        <dt className="text-xs font-medium uppercase tracking-wide text-studio-muted">
          Prompt
        </dt>
        <dd className="mt-1 whitespace-pre-wrap text-studio-fg">{recipe.prompt}</dd>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-studio-muted">
            Model
          </dt>
          <dd className="mt-1 text-studio-fg">{model.label}</dd>
          {model.description ? (
            <p className="mt-1 text-xs text-studio-muted">{model.description}</p>
          ) : null}
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-studio-muted">
            Aspect ratio
          </dt>
          <dd className="mt-1 text-studio-fg">{recipe.aspectRatio}</dd>
        </div>
      </div>

      {effectPreset ? (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-studio-muted">
            Effect preset
          </dt>
          <dd className="mt-1 text-studio-fg">{effectPreset.name}</dd>
        </div>
      ) : null}

      {recipe.referenceFileName ? (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-studio-muted">
            Reference image
          </dt>
          <dd className="mt-1 text-studio-fg">{recipe.referenceFileName}</dd>
          <p className="mt-1 text-xs text-studio-muted">
            Filename only — re-attach the file in the composer if you remix.
          </p>
        </div>
      ) : null}

      {createdAtLabel ? (
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-studio-muted">
            Created
          </dt>
          <dd className="mt-1 text-studio-fg">{createdAtLabel}</dd>
        </div>
      ) : null}
    </dl>
  );
}
