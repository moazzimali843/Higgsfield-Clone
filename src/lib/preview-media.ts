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

const pexelsVideo = (id: number, alt: string, posterPhotoId: number) =>
  ({
    type: "video" as const,
    src: `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_25fps.mp4`,
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
  "/effects": pexelsPhoto(2832382, "Neon trails and stylized visual effects"),
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
