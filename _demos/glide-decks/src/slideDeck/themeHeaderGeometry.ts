import type { ShapeSpec, SlideDeckTheme, ThemeElement, TextBoxSpec } from "../types/slideDeck";
import { DEFAULT_SLIDE_HEIGHT_EMU, DEFAULT_SLIDE_WIDTH_EMU } from "../types/slideDeck/constants";
import { createEmptyTextBoxSpec } from "./defaultTextBoxSpec";
import { mergeTextRunStyle, getPlaceholderDefaultStyle } from "./placeholderTypography";
import { precisionLedgerColors } from "./precisionLedgerUi";
import { BUILTIN_THEME_MASTER_IDS } from "./builtinThemeMasterIds";

/** ~0.5 in slide margin — matches built-in layouts. */
export const SLIDE_MARGIN_EMU = 457_200;

export const TITLE_PLACEHOLDER_HEIGHT_EMU = 800_000;

/** Gap between accent bar and main content region (charts, body). */
export const GAP_EMU_BELOW_ACCENT = 120_000;

/** Matches legacy layout: title band bottom reference + offset to accent. */
const TITLE_BOTTOM_REF_EMU = SLIDE_MARGIN_EMU + 850_000;
const ACCENT_OFFSET_BELOW_TITLE_REF_EMU = 50_000;

/** Shared with static sample preview — theme palette slot, not app tokens. */
export const SALARY_VARIANCE_TITLE_ACCENT_SHAPE_SPEC: ShapeSpec = {
  shape_kind: "rectangle",
  fill: { kind: "solid", color: "accent_1" },
  border: null,
};

/** Canonical EMU size; width = 1in; height ≈ 4px on a 720px-tall 16:9 slide. */
export const SALARY_VARIANCE_TITLE_ACCENT_WIDTH_EMU = 914_400;
export const SALARY_VARIANCE_TITLE_ACCENT_HEIGHT_EMU = 38_100;

/**
 * Visual nudge for the accent bar only (layout `contentTop` unchanged).
 * ~20 CSS px when the slide is scaled to ~1920px wide: 20 * (slideWidthEmu / 1920).
 */
const ACCENT_BAR_NUDGE_UP_EMU = Math.round((20 * DEFAULT_SLIDE_WIDTH_EMU) / 1920);

/** 2.5rem headline — matches sample `text-on-surface` + extrabold. */
const SALARY_HEADLINE_TITLE_FONT_SIZE_PT = 30;

export function slideInnerWidthEmu(): number {
  return DEFAULT_SLIDE_WIDTH_EMU - 2 * SLIDE_MARGIN_EMU;
}

/** Y position of the red accent bar (below title band). */
export function themeHeaderAccentYEmu(): number {
  return TITLE_BOTTOM_REF_EMU + ACCENT_OFFSET_BELOW_TITLE_REF_EMU;
}

/** Top Y for layout placeholders that sit below the theme header strip. */
export function contentTopAfterThemeHeaderEmu(): number {
  return themeHeaderAccentYEmu() + GAP_EMU_BELOW_ACCENT;
}

export function buildThemeTitlePlaceholderTextBoxSpec(theme: SlideDeckTheme): TextBoxSpec {
  const spec = createEmptyTextBoxSpec();
  const default_style = mergeTextRunStyle(getPlaceholderDefaultStyle(theme, "title"), {
    font_family: theme.font_config.heading_family,
    font_size_pt: SALARY_HEADLINE_TITLE_FONT_SIZE_PT,
    font_weight: 800,
    bold: true,
    color: precisionLedgerColors.onSurface,
  });
  return {
    ...spec,
    placeholder_role: "title",
    placeholder_hint: "Slide title",
    default_style,
  };
}

function themeTitlePlaceholderMasterElement(theme: SlideDeckTheme): ThemeElement {
  const innerW = slideInnerWidthEmu();
  return {
    id: BUILTIN_THEME_MASTER_IDS.titlePlaceholder,
    element_type: "placeholder",
    x: SLIDE_MARGIN_EMU,
    y: SLIDE_MARGIN_EMU,
    width: innerW,
    height: TITLE_PLACEHOLDER_HEIGHT_EMU,
    z_index: 1,
    locked: false,
    placeholder_role: "title",
    spec: buildThemeTitlePlaceholderTextBoxSpec(theme),
  };
}

function themeAccentBarMasterElement(): ThemeElement {
  const accentY = themeHeaderAccentYEmu() - ACCENT_BAR_NUDGE_UP_EMU;
  return {
    id: BUILTIN_THEME_MASTER_IDS.titleAccentBar,
    element_type: "shape",
    x: SLIDE_MARGIN_EMU,
    y: accentY,
    width: SALARY_VARIANCE_TITLE_ACCENT_WIDTH_EMU,
    height: SALARY_VARIANCE_TITLE_ACCENT_HEIGHT_EMU,
    z_index: 2,
    locked: true,
    spec: SALARY_VARIANCE_TITLE_ACCENT_SHAPE_SPEC,
  };
}

/**
 * Precision Ledger–style slide title placeholder + red accent bar for `theme.master_elements`.
 */
export function createPrecisionLedgerThemeHeaderMasterElements(theme: SlideDeckTheme): ThemeElement[] {
  return [themeTitlePlaceholderMasterElement(theme), themeAccentBarMasterElement()];
}

export { DEFAULT_SLIDE_WIDTH_EMU as THEME_HEADER_SLIDE_WIDTH_EMU, DEFAULT_SLIDE_HEIGHT_EMU as THEME_HEADER_SLIDE_HEIGHT_EMU };
