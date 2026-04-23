import type { SlideDeckLayout, SlideDeckTheme } from "../types/slideDeck";

/**
 * Resolves which layout id to use for "+ Add slide" from the theme, with a defensive fallback
 * when the stored id is missing from the current layout list.
 */
export function getDefaultNewSlideLayoutId(theme: SlideDeckTheme, layouts: SlideDeckLayout[]): string {
  const preferred = theme.default_new_slide_layout_id;
  if (preferred != null && preferred !== "" && layouts.some((l) => l.id === preferred)) {
    return preferred;
  }
  return layouts[0]?.id ?? "";
}

/**
 * First layout in definition order for the given theme (matches `layouts` array order from the built-in factory).
 */
export function getFirstLayoutIdForTheme(layouts: SlideDeckLayout[], themeId: string): string {
  const found = layouts.find((l) => l.theme_id === themeId);
  return found?.id ?? layouts[0]?.id ?? "";
}
