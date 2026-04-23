import type { SlideDeckSlide } from "../types/slideDeck";

/**
 * Theme master placeholder is not shown when a slide element overrides it, or when the user deleted
 * the placeholder for this slide instance (suppressed ids).
 */
export function isThemePlaceholderHiddenOnSlide(
  themePlaceholderId: string,
  overriddenThemeIds: Set<string>,
  slide: SlideDeckSlide,
): boolean {
  if (overriddenThemeIds.has(themePlaceholderId)) return true;
  const suppressed = slide.suppressed_theme_placeholder_ids ?? [];
  return suppressed.includes(themePlaceholderId);
}
