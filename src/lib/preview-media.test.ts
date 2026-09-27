import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getLibraryCatalogGallery,
  getPreviewGallery,
  getPreviewMedia,
} from "@/lib/preview-media";

describe("getPreviewGallery", () => {
  it("returns a large image-only gallery on the image route", () => {
    const gallery = getPreviewGallery("/image");
    assert.ok(gallery.length >= 10);
    assert.ok(gallery.every((item) => item.type === "image"));
    assert.equal(gallery[0]?.src, getPreviewMedia("/image")?.src);
  });

  it("returns a large video-only gallery on the video route", () => {
    const gallery = getPreviewGallery("/video");
    assert.ok(gallery.length >= 10);
    assert.ok(gallery.every((item) => item.type === "video"));
    assert.equal(gallery[0]?.src, getPreviewMedia("/video")?.src);
  });

  it("returns multiple items for the library route", () => {
    const gallery = getPreviewGallery("/library");
    assert.ok(gallery.length >= 4);
    assert.equal(gallery[0]?.src, getPreviewMedia("/library")?.src);
  });

  it("combines image and video galleries for the library catalog", () => {
    const catalog = getLibraryCatalogGallery();
    const imageCount = getPreviewGallery("/image").length;
    const videoCount = getPreviewGallery("/video").length;
    assert.ok(catalog.length >= imageCount + videoCount - 1);
    assert.ok(catalog.some((item) => item.type === "image"));
    assert.ok(catalog.some((item) => item.type === "video"));
    const uniqueSrc = new Set(catalog.map((item) => item.src));
    assert.equal(uniqueSrc.size, catalog.length);
  });

  it("falls back to a single item for routes without a gallery", () => {
    const gallery = getPreviewGallery("/audio");
    assert.equal(gallery.length, 1);
    assert.equal(gallery[0]?.src, getPreviewMedia("/audio")?.src);
  });
});
