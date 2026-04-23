import type { FillSpec } from "../types/slideDeck/fill";
import type { ThemeColorPalette } from "../types/slideDeck/theme";

/**
 * Resolves a slide `FillSpec` to a CSS color string for authoring preview.
 * Solid fills may use a hex color or a key of {@link ThemeColorPalette}.
 */
export function resolveFillToCss(fill: FillSpec, palette: ThemeColorPalette): string {
  if (fill.kind === "none") return "transparent";
  if (fill.kind !== "solid" || fill.color == null || fill.color === "") {
    return "transparent";
  }
  const raw = fill.color;
  if (raw in palette) {
    return palette[raw as keyof ThemeColorPalette];
  }
  if (raw.startsWith("#")) return raw;
  return raw;
}

/** Resolve a theme palette slot name or hex to a CSS color (text and border). */
export function resolveColorToken(raw: string, palette: ThemeColorPalette): string {
  if (raw in palette) {
    return palette[raw as keyof ThemeColorPalette];
  }
  if (raw.startsWith("#")) return raw;
  return raw;
}
