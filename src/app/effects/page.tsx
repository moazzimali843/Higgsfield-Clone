import type { Metadata } from "next";
import { EffectPresetCard } from "@/components/EffectPresetCard";
import { MotionReveal } from "@/components/MotionReveal";
import { StudioPageHeader } from "@/components/StudioPageHeader";
import { listEffectPresets } from "@/data/effect-presets";
import { getPreviewMedia } from "@/lib/preview-media";

export const metadata: Metadata = {
  title: "Effects",
  description:
    "Browse local effect presets and open a recipe in the image composer.",
};

export default function EffectsPage() {
  const presets = listEffectPresets();
  const heroMedia = getPreviewMedia("/effects");

  return (
    <div className="flex flex-col gap-12">
      <StudioPageHeader
        eyebrow="Preset gallery"
        title="Effect recipes"
        description={
          <>
            Each card is a local recipe: name, still, prompt, and settings, not
            a motion-tracking pipeline. Pick one to pre-fill the image composer,
            then generate a labeled demo from Image.
          </>
        }
        heroMedia={heroMedia}
        heroAspectClass="aspect-[16/10]"
        heroMaxWidth="max-w-md"
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {presets.map((preset, index) => (
          <li key={preset.id} className="min-h-full">
            <MotionReveal delay={Math.min(index * 55, 400)}>
              <EffectPresetCard preset={preset} />
            </MotionReveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
