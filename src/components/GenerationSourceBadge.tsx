import type { GenerationSource } from "@/lib/generation-types";
import { DemoBadge } from "@/components/DemoBadge";

type GenerationSourceBadgeProps = {
  source: GenerationSource;
};

export function GenerationSourceBadge({ source }: GenerationSourceBadgeProps) {
  if (source === "higgsfield") {
    return (
      <span
        className="inline-flex items-center rounded-md border border-emerald-300/70 bg-emerald-950/95 px-2 py-0.5 text-xs font-semibold text-emerald-50 shadow-md ring-1 ring-black/40"
      >
        Real · Soul v2
      </span>
    );
  }
  return <DemoBadge />;
}
