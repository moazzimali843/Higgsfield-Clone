"use client";

import { useEffect, useMemo, useState } from "react";
import { EffectPresetCard } from "@/components/EffectPresetCard";
import { MotionReveal } from "@/components/MotionReveal";
import type { EffectPreset } from "@/lib/effect-preset-types";

type EffectsPageClientProps = {
  presets: EffectPreset[];
  initialQuery?: string;
};

function matchesQuery(preset: EffectPreset, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    preset.name,
    preset.tagline,
    preset.prompt,
    preset.id,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function EffectsPageClient({
  presets,
  initialQuery = "",
}: EffectsPageClientProps) {
  const [filterQuery, setFilterQuery] = useState(initialQuery);

  useEffect(() => {
    setFilterQuery(initialQuery);
  }, [initialQuery]);

  const filtered = useMemo(
    () => presets.filter((p) => matchesQuery(p, filterQuery)),
    [presets, filterQuery],
  );

  return (
    <>
      <div className="max-w-md">
        <label htmlFor="effects-search" className="sr-only">
          Search effect presets
        </label>
        <input
          id="effects-search"
          type="search"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Search presets…"
          className="studio-input w-full"
        />
      </div>

      {filterQuery.trim() && filtered.length === 0 ? (
        <p className="text-sm text-studio-muted" role="status">
          No presets match &ldquo;{filterQuery.trim()}&rdquo;. Try a shorter
          phrase or different keywords.
        </p>
      ) : null}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((preset, index) => (
          <li key={preset.id} className="min-h-full">
            <MotionReveal delay={Math.min(index * 55, 400)}>
              <EffectPresetCard preset={preset} />
            </MotionReveal>
          </li>
        ))}
      </ul>
    </>
  );
}
