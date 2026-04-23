import type { CSSProperties } from "react";
import { precisionLedgerColors } from "./precisionLedgerUi";
import type { PlaceholderRole, TextRunStyle } from "../types/slideDeck";
import type { SlideDeckTheme } from "../types/slideDeck";

/** ~1.5rem at 96dpi — matches LayoutElementView title placeholder. */
export const PLACEHOLDER_TITLE_FONT_SIZE_PT = 18;
/** ~1rem — matches LayoutElementView non-title placeholders. */
export const PLACEHOLDER_BODY_FONT_SIZE_PT = 12;

/**
 * Default typography for layout placeholders by role. Align with `LayoutElementView` preview:
 * - `title`: theme heading stack, heading weight, larger pt, secondary label color.
 * - Other roles: body family, body weight, body pt, same muted color (subtitle/body share v1 rules).
 */
export function getPlaceholderDefaultStyle(theme: SlideDeckTheme, role: PlaceholderRole): TextRunStyle {
  if (role === "title") {
    return {
      font_family: theme.font_config.heading_family,
      font_size_pt: PLACEHOLDER_TITLE_FONT_SIZE_PT,
      font_weight: theme.font_config.heading_weight,
      bold: theme.font_config.heading_weight >= 600,
      color: precisionLedgerColors.secondaryText,
    };
  }
  return {
    font_family: theme.font_config.body_family,
    font_size_pt: PLACEHOLDER_BODY_FONT_SIZE_PT,
    font_weight: theme.font_config.body_weight,
    bold: theme.font_config.body_weight >= 600,
    color: precisionLedgerColors.secondaryText,
  };
}

/** Shallow merge: `override` keys replace `base`; undefined in override does not clear base. */
export function mergeTextRunStyle(base: TextRunStyle, override: TextRunStyle): TextRunStyle {
  const out: TextRunStyle = { ...base };
  for (const key of Object.keys(override) as (keyof TextRunStyle)[]) {
    const v = override[key];
    if (v !== undefined) {
      (out as Record<string, unknown>)[key] = v;
    }
  }
  return out;
}

export function isTextRunStyleUnset(style: TextRunStyle | undefined): boolean {
  if (!style || typeof style !== "object") return true;
  return Object.keys(style).length === 0;
}

/** Convert CSS pt to px (browser: 1pt = 1/72in, 96dpi → 96/72 px per pt). */
export function fontSizePtToPx(fontSizePt: number): number {
  return (fontSizePt * 96) / 72;
}

/**
 * Maps persisted `TextRunStyle` to inline CSS. Hex `color` passes through; theme palette slot names are not resolved here (callers should persist hex in spec).
 */
export function textRunStyleToCss(style: TextRunStyle, _theme: SlideDeckTheme): CSSProperties {
  const css: CSSProperties = {
    whiteSpace: "pre-wrap",
    margin: 0,
    lineHeight: 1.5,
  };

  if (style.font_family) {
    css.fontFamily = style.font_family;
  }
  if (style.font_size_pt != null && Number.isFinite(style.font_size_pt)) {
    css.fontSize = `${fontSizePtToPx(style.font_size_pt)}px`;
  }
  if (style.font_weight != null && Number.isFinite(style.font_weight)) {
    css.fontWeight = style.font_weight;
  } else if (style.bold === true) {
    css.fontWeight = 700;
  } else if (style.bold === false) {
    css.fontWeight = 400;
  }
  if (style.italic === true) {
    css.fontStyle = "italic";
  } else if (style.italic === false) {
    css.fontStyle = "normal";
  }
  if (style.underline === true) {
    css.textDecoration = "underline";
  } else if (style.underline === false) {
    css.textDecoration = "none";
  }
  if (style.strikethrough === true) {
    css.textDecoration =
      style.underline === true ? "underline line-through" : "line-through";
  }
  if (style.color) {
    css.color = style.color;
  }

  return css;
}
