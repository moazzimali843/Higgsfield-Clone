import Link from "next/link";
import type { EffectPreset } from "@/lib/effect-preset-types";
import { composerHrefForPreset } from "@/data/effect-presets";
import { MediaPreview } from "@/components/MediaPreview";
import { MediaFlipPanel } from "@/components/MediaFlipPanel";

type EffectPresetCardProps = {
  preset: EffectPreset;
};

export function EffectPresetCard({ preset }: EffectPresetCardProps) {
  return (
      <Link
        href={composerHrefForPreset(preset.id)}
        className="studio-card studio-card-interactive studio-border-glow-card group/card flex h-full flex-col overflow-hidden"
      >
        <MediaFlipPanel
          aspectClass="aspect-[4/5]"
          front={
            <MediaPreview
              media={preset.still}
              motion="still"
              aspectClass="aspect-[4/5] h-full min-h-full"
              showCredit={false}
              className="h-full min-h-full rounded-none"
            />
          }
          back={
            <div className="studio-media-flip-back-panel">
              <p className="studio-eyebrow text-[10px]">Recipe</p>
              <p className="studio-display text-lg font-semibold text-studio-fg">
                {preset.name}
              </p>
              <dl className="mt-2 space-y-1 text-sm text-studio-muted">
                <div>
                  <dt className="inline font-medium text-studio-fg">Aspect </dt>
                  <dd className="inline">{preset.settings.aspectRatio}</dd>
                </div>
                <div>
                  <dt className="inline font-medium text-studio-fg">Model </dt>
                  <dd className="inline capitalize">
                    {preset.settings.modelId.replace(/-/g, " ")}
                  </dd>
                </div>
              </dl>
            </div>
          }
        />
        <div className="studio-card-body flex flex-1 flex-col p-5">
          <h3 className="studio-display text-lg font-semibold text-studio-fg transition-colors group-hover/card:text-studio-accent-bright">
            {preset.name}
          </h3>
          <p className="mt-1 text-sm text-studio-muted">{preset.tagline}</p>
          <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-studio-muted">
            {preset.prompt}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-studio-muted">
            <div>
              <dt className="inline font-medium text-studio-fg">Aspect </dt>
              <dd className="inline">{preset.settings.aspectRatio}</dd>
            </div>
            <div>
              <dt className="inline font-medium text-studio-fg">Model </dt>
              <dd className="inline capitalize">
                {preset.settings.modelId.replace(/-/g, " ")}
              </dd>
            </div>
          </dl>
          <span className="mt-4 text-sm font-medium text-studio-accent-bright">
            Open in composer
          </span>
        </div>
      </Link>
  );
}
