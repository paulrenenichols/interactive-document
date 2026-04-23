import { describe, expect, it } from "vitest";
import type { SlideDeckSlide } from "../types/slideDeck";
import { reorderSlidesByOrderIndex } from "./reorderSlides";

function slide(id: string, order: number): SlideDeckSlide {
  const t = "2020-01-01T00:00:00.000Z";
  return {
    id,
    document_id: "doc",
    layout_id: "layout",
    order_index: order,
    name: null,
    notes: null,
    thumbnail_asset_id: null,
    elements: [],
    suppressed_layout_placeholder_ids: [],
    suppressed_theme_placeholder_ids: [],
    background_fill_override: null,
    hidden: false,
    created_at: t,
    updated_at: t,
  };
}

describe("reorderSlidesByOrderIndex", () => {
  it("reorders by sorted deck indices and closes gaps with 1-based order_index", () => {
    const s = [slide("a", 1), slide("b", 2), slide("c", 3)];
    const r = reorderSlidesByOrderIndex(s, 2, 0);
    expect(r.map((x) => x.id)).toEqual(["c", "a", "b"]);
    expect(r.map((x) => x.order_index)).toEqual([1, 2, 3]);
  });

  it("returns original when index out of range", () => {
    const s = [slide("a", 1)];
    expect(reorderSlidesByOrderIndex(s, 1, 0)).toEqual(s);
  });
});
