export type HomeGalleryCategory = "all" | "image" | "video" | "library";

export type HomeGalleryRouteItem = {
  kind: "route";
  href: "/image" | "/video" | "/library";
  id: string;
};

export type HomeGalleryItem = HomeGalleryRouteItem;

export function filterHomeGalleryItems(
  items: HomeGalleryItem[],
  category: HomeGalleryCategory,
): HomeGalleryItem[] {
  if (category === "all") {
    return items;
  }
  if (category === "image") {
    return items.filter(
      (item) => item.kind === "route" && item.href === "/image",
    );
  }
  if (category === "video") {
    return items.filter(
      (item) => item.kind === "route" && item.href === "/video",
    );
  }
  return items.filter(
    (item) => item.kind === "route" && item.href === "/library",
  );
}
