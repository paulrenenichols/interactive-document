import type { FillSpec } from "../types/slideDeck/fill";
import type { ThemeColorPalette } from "../types/slideDeck/theme";
import { resolveColorToken } from "./resolveFillToCss";

const HEX_3_OR_6 = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Normalize `#rgb` / `#rrggbb` to lowercase `#rrggbb` for `<input type="color">`. */
export function normalizeHexForColorInput(raw: string): string | null {
  const t = raw.trim();
  if (!HEX_3_OR_6.test(t)) return null;
  const s = t.toLowerCase();
  if (s.length === 4) {
    const r = s[1]!;
    const g = s[2]!;
    const b = s[3]!;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
}

/**
 * Value for a native color swatch: prefer stored hex on `FillSpec`, else resolved theme token, else fallback.
 */
export function colorPickerValueFromFill(fill: FillSpec, palette: ThemeColorPalette, fallbackHex = "#ffffff"): string {
  if (fill.kind === "solid" && fill.color) {
    const direct = normalizeHexForColorInput(fill.color);
    if (direct) return direct;
    const resolved = resolveColorToken(fill.color, palette);
    const fromResolved = normalizeHexForColorInput(resolved);
    if (fromResolved) return fromResolved;
  }
  return normalizeHexForColorInput(fallbackHex) ?? fallbackHex;
}

/**
 * Same as {@link colorPickerValueFromFill} for a raw palette slot or hex string (e.g. border or text color).
 */
export function colorPickerValueFromRawColor(
  stored: string | undefined,
  palette: ThemeColorPalette,
  fallbackHex: string,
): string {
  if (stored) {
    const direct = normalizeHexForColorInput(stored);
    if (direct) return direct;
    const resolved = resolveColorToken(stored, palette);
    const fromResolved = normalizeHexForColorInput(resolved);
    if (fromResolved) return fromResolved;
  }
  return normalizeHexForColorInput(fallbackHex) ?? fallbackHex;
}
