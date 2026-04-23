import type { SlideDeckLayout, SlideDeckSlide, SlideDeckTheme } from "../types/slideDeck";

/** slide-deck-spec §14.1 — implementation paint order (back to front). */
export type SlidePaintLayerKind =
  | "theme_background"
  | "theme_master_elements"
  | "layout_background_override"
  | "layout_elements"
  | "slide_background_override"
  | "slide_elements";

export interface SlidePaintStep {
  kind: SlidePaintLayerKind;
}

/**
 * Ordered compositing steps for a slide. Renderer walks this list in order.
 * Theme/layout/slide payloads are resolved separately; this only fixes sequence.
 */
export function getSlideLayerPaintSteps(
  _theme: SlideDeckTheme,
  _layout: SlideDeckLayout,
  _slide: SlideDeckSlide,
): SlidePaintStep[] {
  return [
    { kind: "theme_background" },
    { kind: "theme_master_elements" },
    { kind: "layout_background_override" },
    { kind: "layout_elements" },
    { kind: "slide_background_override" },
    { kind: "slide_elements" },
  ];
}
