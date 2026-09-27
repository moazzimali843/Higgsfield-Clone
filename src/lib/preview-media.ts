/** Placeholder showcase media — creative / AV only (Pexels). Not app-generated output. */

export type PreviewMedia = {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  credit: { label: string; href: string };
};

const pexelsPhoto = (id: number, alt: string) =>
  ({
    type: "image" as const,
    src: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    alt,
    credit: { label: "Pexels", href: "https://www.pexels.com/license/" },
  }) satisfies PreviewMedia;

type PexelsVideoFile =
  | "hd_1920_1080_25fps"
  | "hd_1920_1080_30fps";

const pexelsVideo = (
  id: number,
  alt: string,
  posterPhotoId: number,
  file: PexelsVideoFile = "hd_1920_1080_25fps",
) =>
  ({
    type: "video" as const,
    src: `https://videos.pexels.com/video-files/${id}/${id}-${file}.mp4`,
    poster: `https://images.pexels.com/photos/${posterPhotoId}/pexels-photo-${posterPhotoId}.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    alt,
    credit: { label: "Pexels", href: "https://www.pexels.com/license/" },
  }) satisfies PreviewMedia;

export function getStillImageSrc(media: PreviewMedia): string {
  if (media.type === "image") return media.src;
  return media.poster ?? media.src;
}

/** Home hero — fluid color and motion (generative-art feel) */
export const homeHeroMedia: PreviewMedia = pexelsVideo(
  1409899,
  "Vibrant ink and paint swirling in water",
  7878399,
);

export const previewMediaByHref: Record<string, PreviewMedia> = {
  "/image": pexelsPhoto(774909, "Fashion portrait with dramatic studio lighting"),
  "/library": pexelsPhoto(
    1193743,
    "Gallery wall of framed photographs and prints",
  ),
  "/video": pexelsVideo(
    3195394,
    "Cinematic aerial view over a city at golden hour",
    7991579,
  ),
  "/audio": pexelsPhoto(
    3379091,
    "Vocal recording in a studio with microphone",
  ),
  "/3d": pexelsPhoto(7878399, "Abstract 3D shapes and soft gradients"),
  "/edit": pexelsPhoto(
    5935793,
    "Retouching a photograph on a graphics tablet",
  ),
  "/cinema-studio": pexelsVideo(
    856973,
    "Cinema camera on a professional film set",
    7991579,
  ),
  "/marketing-studio": pexelsPhoto(
    7688336,
    "Creative team reviewing brand and campaign visuals",
  ),
  "/supercomputer": pexelsPhoto(
    6753187,
    "Abstract flowing light suggesting AI computation",
  ),
  "/contests": pexelsPhoto(2774556, "Trophy under celebratory lights"),
  "/community": pexelsPhoto(
    3184418,
    "Creators collaborating over visual work",
  ),
  "/canvas": pexelsPhoto(
    8410800,
    "Digital illustration on a drawing tablet",
  ),
  "/mcp": pexelsPhoto(
    8386434,
    "Friendly AI assistant character for creative tools",
  ),
};

export function getPreviewMedia(href: string): PreviewMedia | undefined {
  return previewMediaByHref[href];
}

const imagePageGallery = [
  pexelsPhoto(774909, "Fashion portrait with dramatic studio lighting"),
  pexelsPhoto(415829, "Portrait with soft natural light"),
  pexelsPhoto(1024311, "Minimal product still life"),
  pexelsPhoto(196644, "Landscape with warm tones"),
  pexelsPhoto(7878399, "Abstract shapes and soft gradients"),
  pexelsPhoto(5935793, "Retouching a photograph on a graphics tablet"),
  pexelsPhoto(7688336, "Creative team reviewing campaign visuals"),
  pexelsPhoto(6753187, "Abstract flowing light trails"),
  pexelsPhoto(2774556, "Trophy under celebratory lights"),
  pexelsPhoto(3184418, "Creators collaborating over visual work"),
  pexelsPhoto(8410800, "Digital illustration on a drawing tablet"),
  pexelsPhoto(8386434, "Friendly AI assistant for creative tools"),
];

const videoPageGallery = [
  pexelsVideo(
    3195394,
    "Cinematic aerial view over a city at golden hour",
    7991579,
  ),
  pexelsVideo(
    856973,
    "Camera move through a professional film set",
    7991579,
  ),
  pexelsVideo(
    1409899,
    "Vibrant ink and paint swirling in water",
    7878399,
  ),
  pexelsVideo(6981411, "Coastal cliffs and ocean from above", 196644),
  pexelsVideo(3045163, "Busy city intersection at night", 7688336),
  pexelsVideo(6195517, "Rolling hills under a wide sky", 196644),
  pexelsVideo(
    3129671,
    "Morning fog drifting over forested mountains",
    196644,
    "hd_1920_1080_30fps",
  ),
  pexelsVideo(
    3571264,
    "Turquoise water and white sand from the air",
    196644,
    "hd_1920_1080_30fps",
  ),
  pexelsVideo(
    2169880,
    "City traffic streaks of light at night",
    6753187,
    "hd_1920_1080_30fps",
  ),
  pexelsVideo(
    2278095,
    "Golden sunset clouds over open landscape",
    196644,
    "hd_1920_1080_30fps",
  ),
  pexelsVideo(6620876, "Waves breaking along a rocky shoreline", 196644),
  pexelsVideo(6620880, "Drone flight over autumn woodland", 196644),
];

const previewGalleryByHref: Record<string, PreviewMedia[]> = {
  "/image": imagePageGallery,
  "/video": videoPageGallery,
  "/library": [
    previewMediaByHref["/library"],
    pexelsPhoto(196644, "Collection of creative stills"),
    pexelsPhoto(1024311, "Organized visual references"),
    pexelsPhoto(415829, "Saved portrait generation"),
  ],
};

export function getPreviewGallery(href: string): PreviewMedia[] {
  const gallery = previewGalleryByHref[href];
  if (gallery) return gallery.filter(Boolean);
  const single = getPreviewMedia(href);
  return single ? [single] : [];
}

/** Image + video page showcase items, deduped by `src`, for the library grid. */
export function getLibraryCatalogGallery(): PreviewMedia[] {
  const combined = [
    ...getPreviewGallery("/image"),
    ...getPreviewGallery("/video"),
  ];
  const seen = new Set<string>();
  const out: PreviewMedia[] = [];
  for (const item of combined) {
    if (seen.has(item.src)) continue;
    seen.add(item.src);
    out.push(item);
  }
  return out;
}

export function showcaseIdForPreviewSrc(src: string): string {
  let hash = 0;
  for (let i = 0; i < src.length; i++) {
    hash = Math.imul(31, hash) + src.charCodeAt(i);
    hash |= 0;
  }
  return `showcase-${(hash >>> 0).toString(36)}`;
}
