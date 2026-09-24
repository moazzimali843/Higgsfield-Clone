import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aspectImageHeightFactor,
  distributeToShortestColumns,
  estimatedLibraryCardHeight,
} from "@/lib/library-masonry";

describe("library-masonry", () => {
  it("estimates taller cards for portrait aspect ratios", () => {
    assert.ok(
      estimatedLibraryCardHeight({ aspectRatio: "9:16" }) >
        estimatedLibraryCardHeight({ aspectRatio: "1:1" }),
    );
  });

  it("aspectImageHeightFactor matches ratio geometry", () => {
    assert.equal(aspectImageHeightFactor("16:9"), 9 / 16);
    assert.equal(aspectImageHeightFactor("9:16"), 16 / 9);
  });

  it("distributeToShortestColumns packs short items under shorter columns", () => {
    const items = ["a", "b", "c", "d"] as const;
    const heights: Record<string, number> = {
      a: 1,
      b: 1,
      c: 5,
      d: 1,
    };
    const columns = distributeToShortestColumns(
      [...items],
      3,
      (id) => heights[id],
    );
    assert.deepEqual(columns[0], ["a", "d"]);
    assert.deepEqual(columns[1], ["b"]);
    assert.deepEqual(columns[2], ["c"]);
  });
});
