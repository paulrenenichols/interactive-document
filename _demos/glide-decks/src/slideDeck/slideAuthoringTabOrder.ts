import type { SlideAuthoringSelection } from "../data/SlideElementSelectionContext";
import type { SlideDeckLayout, SlideDeckSlide, SlideDeckTheme } from "../types/slideDeck";
import { isLayoutPlaceholderHiddenOnSlide } from "./layoutPlaceholderVisibility";
import { isThemePlaceholderHiddenOnSlide } from "./themePlaceholderVisibility";

function sortByZIndexAsc<T extends { z_index: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.z_index - b.z_index);
}

/**
 * Canonical tab order for canvas selection: theme masters (back → front), then layout, then slide.
 * Matches §14.1 layer sequence; within each layer, `z_index` ascending. Not persisted — derived at runtime.
 *
 * Align with `SlideAuthoringCanvas` hit-test eligibility (materialized or suppressed layout / theme placeholders omitted).
 */
export function buildSlideAuthoringTabOrder(
  theme: SlideDeckTheme,
  layout: SlideDeckLayout,
  slide: SlideDeckSlide,
): SlideAuthoringSelection[] {
  const slideId = slide.id;
  const overriddenLayoutIds = new Set(
    slide.elements.map((e) => e.layout_element_id).filter((x): x is string => Boolean(x)),
  );
  const overriddenThemeIds = new Set(
    slide.elements.map((e) => e.theme_element_id).filter((x): x is string => Boolean(x)),
  );

  const out: SlideAuthoringSelection[] = [];

  const themeEls = sortByZIndexAsc(theme.master_elements.filter((e) => !e.locked)).filter((el) => {
    if (el.element_type === "placeholder" && isThemePlaceholderHiddenOnSlide(el.id, overriddenThemeIds, slide))
      return false;
    return true;
  });
  for (const el of themeEls) {
    out.push({ kind: "theme", slideId, themeElementId: el.id });
  }

  const layoutEls = sortByZIndexAsc(layout.elements).filter((el) => {
    if (el.element_type === "placeholder" && isLayoutPlaceholderHiddenOnSlide(el.id, overriddenLayoutIds, slide))
      return false;
    return true;
  });
  for (const el of layoutEls) {
    out.push({ kind: "layout", slideId, layoutElementId: el.id });
  }

  const slideEls = sortByZIndexAsc(slide.elements.filter((e) => !e.hidden));
  for (const el of slideEls) {
    out.push({ kind: "slide", slideId, elementId: el.id });
  }

  return out;
}

export function selectionEquals(a: SlideAuthoringSelection, b: SlideAuthoringSelection): boolean {
  if (a.slideId !== b.slideId || a.kind !== b.kind) return false;
  if (a.kind === "slide" && b.kind === "slide") return a.elementId === b.elementId;
  if (a.kind === "layout" && b.kind === "layout") return a.layoutElementId === b.layoutElementId;
  if (a.kind === "theme" && b.kind === "theme") return a.themeElementId === b.themeElementId;
  return false;
}

/**
 * @returns Next or previous selection in `order` with wrap, or `null` if `current` is absent or `order` is empty.
 */
export function advanceSlideAuthoringSelection(
  order: SlideAuthoringSelection[],
  current: SlideAuthoringSelection,
  delta: 1 | -1,
): SlideAuthoringSelection | null {
  if (order.length === 0) return null;
  const idx = order.findIndex((s) => selectionEquals(s, current));
  if (idx < 0) return null;
  const n = order.length;
  const nextIdx = ((idx + delta) % n + n) % n;
  return order[nextIdx];
}
