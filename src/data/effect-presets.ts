import type { PreviewMedia } from "@/lib/preview-media";
import type { EffectPreset } from "@/lib/effect-preset-types";

const pexelsStill = (id: number, alt: string): PreviewMedia => ({
  type: "image",
  src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`,
  alt,
  credit: { label: "Pexels", href: "https://www.pexels.com/license/" },
});

/** Local recipe cards — inspired by Visual Effects looks, not motion pipelines. */
const effectPresets: EffectPreset[] = [
  {
    id: "neon-drift",
    name: "Neon Drift",
    tagline: "Electric trails and cyberpunk glow",
    prompt:
      "Portrait with neon light trails wrapping the subject, cyberpunk city bokeh, magenta and cyan accents, cinematic contrast, shallow depth of field",
    still: pexelsStill(2832382, "Neon light trails and stylized glow"),
    settings: { aspectRatio: "9:16", modelId: "demo" },
  },
  {
    id: "floating-fall",
    name: "Floating Fall",
    tagline: "Slow-motion levitation energy",
    prompt:
      "Subject suspended in mid-air with fabric and hair floating upward, soft studio light, dreamy atmosphere, high-fashion editorial, clean background",
    still: pexelsStill(1183266, "Fashion portrait with floating fabric energy"),
    settings: { aspectRatio: "9:16", modelId: "demo" },
  },
  {
    id: "film-grain-noir",
    name: "Film Grain Noir",
    tagline: "Monochrome drama and texture",
    prompt:
      "Black and white portrait, heavy film grain, hard side light, noir detective mood, sharp eyes, deep shadows, 35mm analog look",
    still: pexelsStill(674010, "High-contrast monochrome portrait"),
    settings: { aspectRatio: "4:3", modelId: "demo" },
  },
  {
    id: "golden-hour-wash",
    name: "Golden Hour Wash",
    tagline: "Warm sun flare and soft skin",
    prompt:
      "Outdoor portrait at golden hour, warm lens flare, soft haze, natural skin tones, backlit hair, gentle film color grade",
    still: pexelsStill(415829, "Warm golden hour portrait"),
    settings: { aspectRatio: "16:9", modelId: "demo" },
  },
  {
    id: "chrome-bloom",
    name: "Chrome Bloom",
    tagline: "Metallic highlights and bloom",
    prompt:
      "Futuristic fashion portrait, chrome and liquid metal highlights on clothing, soft bloom, studio rim light, surreal luxury aesthetic",
    still: pexelsStill(1036623, "Metallic fashion styling"),
    settings: { aspectRatio: "1:1", modelId: "demo" },
  },
  {
    id: "paper-cut-depth",
    name: "Paper Cut Depth",
    tagline: "Layered collage dimension",
    prompt:
      "Portrait styled as layered paper cut art, bold color planes, subtle drop shadows between layers, playful graphic design, studio lighting",
    still: pexelsStill(1762851, "Colorful layered paper craft aesthetic"),
    settings: { aspectRatio: "3:4", modelId: "demo" },
  },
  {
    id: "storm-static",
    name: "Storm Static",
    tagline: "Weather drama and motion blur",
    prompt:
      "Dramatic portrait in heavy rain, motion blur on rain streaks, cool blue grade, intense expression, cinematic anamorphic feel",
    still: pexelsStill(1252869, "Dramatic rainy atmosphere"),
    settings: { aspectRatio: "16:9", modelId: "demo" },
  },
  {
    id: "velvet-spotlight",
    name: "Velvet Spotlight",
    tagline: "Stage light on rich texture",
    prompt:
      "Theatrical portrait under a single spotlight, velvet curtains in background, rich reds and deep shadows, classic stage photography",
    still: pexelsStill(713149, "Theatrical spotlight portrait"),
    settings: { aspectRatio: "4:3", modelId: "demo" },
  },
];

export function listEffectPresets(): EffectPreset[] {
  return effectPresets;
}

export function getEffectPresetById(id: string): EffectPreset | undefined {
  return effectPresets.find((preset) => preset.id === id);
}

export function composerHrefForPreset(presetId: string): string {
  return `/image?preset=${encodeURIComponent(presetId)}`;
}
