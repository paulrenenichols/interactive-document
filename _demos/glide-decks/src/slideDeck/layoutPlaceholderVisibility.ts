import type { SlideDeckSlide } from "../types/slideDeck";

/**
 * Layout placeholder is not shown when a slide element overrides it, or when the user deleted
 * the placeholder for this slide instance (suppressed ids).
 */
export function isLayoutPlaceholderHiddenOnSlide(
  layoutPlaceholderId: string,
  overriddenLayoutIds: Set<string>,
  slide: SlideDeckSlide,
): boolean {
  if (overriddenLayoutIds.has(layoutPlaceholderId)) return true;
  const suppressed = slide.suppressed_layout_placeholder_ids ?? [];
  return suppressed.includes(layoutPlaceholderId);
}
