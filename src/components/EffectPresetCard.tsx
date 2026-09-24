import Link from "next/link";
import type { EffectPreset } from "@/lib/effect-preset-types";
import { composerHrefForPreset } from "@/data/effect-presets";
import { MediaPreview } from "@/components/MediaPreview";

type EffectPresetCardProps = {
  preset: EffectPreset;
};

export function EffectPresetCard({ preset }: EffectPresetCardProps) {
  return (
    <Link
      href={composerHrefForPreset(preset.id)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-studio-border bg-studio-panel transition hover:border-studio-accent/40 hover:shadow-lg hover:shadow-studio-accent/5"
    >
      <MediaPreview
        media={preset.still}
        motion="still"
        aspectClass="aspect-[4/5]"
        showCredit={false}
        className="rounded-none rounded-t-xl"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-studio-fg group-hover:text-studio-accent">
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
        <span className="mt-4 text-sm font-medium text-studio-accent">
          Open in composer →
        </span>
      </div>
    </Link>
  );
}
