import type {
  GenerationSource,
  LibraryMediaType,
} from "@/lib/generation-types";
import { DemoBadge } from "@/components/DemoBadge";

type GenerationSourceBadgeProps = {
  source: GenerationSource;
  mediaType?: LibraryMediaType;
};

export function GenerationSourceBadge({
  source,
  mediaType = "image",
}: GenerationSourceBadgeProps) {
  if (source === "higgsfield") {
    const label =
      mediaType === "video" ? "API · Seedance 2.5" : "API · Soul v2";
    return (
      <span
        className="inline-flex items-center rounded-md border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/20"
      >
        {label}
      </span>
    );
  }
  return <DemoBadge />;
}
