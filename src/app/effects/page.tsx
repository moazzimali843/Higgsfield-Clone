import type { Metadata } from "next";
import { EffectPresetCard } from "@/components/EffectPresetCard";
import { listEffectPresets } from "@/data/effect-presets";
import { getPreviewMedia } from "@/lib/preview-media";
import { MediaPreview } from "@/components/MediaPreview";

export const metadata: Metadata = {
  title: "Effects",
  description:
    "Browse local effect presets and open a recipe in the image composer.",
};

export default function EffectsPage() {
  const presets = listEffectPresets();
  const heroMedia = getPreviewMedia("/effects");

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-studio-accent">
            Preset gallery
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-studio-fg sm:text-4xl">
            Effect recipes
          </h1>
          <p className="mt-4 text-base leading-relaxed text-studio-muted">
            Each card is a local recipe — name, still, prompt, and settings —
            not a motion-tracking pipeline. Pick one to pre-fill the image
            composer; demo generation arrives in Phase 4.
          </p>
        </div>
        {heroMedia ? (
          <div className="w-full max-w-md shrink-0">
            <MediaPreview
              media={heroMedia}
              motion="still"
              aspectClass="aspect-[16/10]"
              showCredit={false}
              className="ring-1 ring-studio-border"
            />
          </div>
        ) : null}
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {presets.map((preset) => (
          <li key={preset.id} className="min-h-full">
            <EffectPresetCard preset={preset} />
          </li>
        ))}
      </ul>
    </div>
  );
}
