import type { SlideDeckSlide } from "../types/slideDeck";

/**
 * Reorder slides by array position (0-based indices into **sorted** deck order) and
 * reassign `order_index` 1..n with no gaps (slide-deck-spec §6.1).
 */
export function reorderSlidesByOrderIndex(
  slides: SlideDeckSlide[],
  fromIndex: number,
  toIndex: number,
): SlideDeckSlide[] {
  const sorted = [...slides].sort((a, b) => a.order_index - b.order_index);
  if (fromIndex < 0 || fromIndex >= sorted.length) return slides;
  if (toIndex < 0 || toIndex >= sorted.length) return slides;
  const next = [...sorted];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  const now = new Date().toISOString();
  return next.map((s, i) => ({
    ...s,
    order_index: i + 1,
    updated_at: now,
  }));
}
