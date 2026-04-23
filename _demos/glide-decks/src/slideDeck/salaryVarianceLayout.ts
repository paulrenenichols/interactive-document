import type { LayoutElement, PlaceholderRole, SlideDeckLayout, SlideDeckTheme } from "../types/slideDeck";
import { DEFAULT_SLIDE_HEIGHT_EMU } from "../types/slideDeck/constants";
import { createEmptyTextBoxSpec } from "./defaultTextBoxSpec";
import { getPlaceholderDefaultStyle } from "./placeholderTypography";
import { contentTopAfterThemeHeaderEmu, slideInnerWidthEmu, SLIDE_MARGIN_EMU } from "./themeHeaderGeometry";

export {
  SALARY_VARIANCE_TITLE_ACCENT_HEIGHT_EMU,
  SALARY_VARIANCE_TITLE_ACCENT_SHAPE_SPEC,
  SALARY_VARIANCE_TITLE_ACCENT_WIDTH_EMU,
} from "./themeHeaderGeometry";

const H = DEFAULT_SLIDE_HEIGHT_EMU;
const M = SLIDE_MARGIN_EMU;

function ph(
  theme: SlideDeckTheme,
  id: string,
  role: PlaceholderRole,
  x: number,
  y: number,
  width: number,
  height: number,
  z: number,
  hint: string,
): LayoutElement {
  const spec = createEmptyTextBoxSpec();
  return {
    id,
    element_type: "placeholder",
    x,
    y,
    width,
    height,
    z_index: z,
    placeholder_role: role,
    spec: {
      ...spec,
      placeholder_role: role,
      placeholder_hint: hint,
      default_style: getPlaceholderDefaultStyle(theme, role),
    },
  };
}

function isoNow(): string {
  return new Date().toISOString();
}

/**
 * Title + two equal square chart placeholders (no footer). Theme supplies title + accent bar;
 * squares are centered in the two-column band below the header.
 */
export function createTitleAccentTwoSquaresLayout(theme: SlideDeckTheme, documentId: string, layoutId: string): SlideDeckLayout {
  const themeId = theme.id;
  const t = isoNow();
  const innerW = slideInnerWidthEmu();
  const gap = 457_200;
  const colW = Math.floor((innerW - gap) / 2);
  const chartTop = contentTopAfterThemeHeaderEmu();
  const chartHAvailable = H - M - chartTop;
  const side = Math.min(colW, chartHAvailable);
  const ySquare = chartTop + Math.floor((chartHAvailable - side) / 2);
  const xLeft = M + Math.floor((colW - side) / 2);
  const xRight = M + colW + gap + Math.floor((colW - side) / 2);

  const elements: LayoutElement[] = [
    ph(theme, "ta2sq-chart-left", "chart", xLeft, ySquare, side, side, 3, "Content placeholder from slide layout"),
    ph(theme, "ta2sq-chart-right", "chart", xRight, ySquare, side, side, 4, "Content placeholder from slide layout"),
  ];

  return {
    id: layoutId,
    document_id: documentId,
    theme_id: themeId,
    name: "Title + Two Squares",
    description: "Salary-style headline and accent bar; two equal square chart placeholders.",
    thumbnail_asset_id: null,
    elements,
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };
}

/**
 * Salary Variance Overview — two chart columns, footer strip. Title + accent come from the theme.
 */
export function createSalaryVarianceOverviewLayout(theme: SlideDeckTheme, documentId: string, layoutId: string): SlideDeckLayout {
  const themeId = theme.id;
  const t = isoNow();
  const innerW = slideInnerWidthEmu();
  const gap = 457_200;
  const colW = Math.floor((innerW - gap) / 2);
  const chartTop = contentTopAfterThemeHeaderEmu();
  const footerH = 450_000;
  const chartH = H - M - chartTop - footerH;
  const footerY = H - M - footerH;

  const elements: LayoutElement[] = [
    ph(theme, "sv-chart-left", "chart", M, chartTop, colW, chartH, 3, "Comp Demographics"),
    ph(theme, "sv-chart-right", "chart", M + colW + gap, chartTop, colW, chartH, 4, "Salary Variance"),
    ph(theme, "sv-footer", "body", M, footerY, innerW, footerH - 50_000, 5, "Footer — proprietary / slide / confidential"),
  ];

  return {
    id: layoutId,
    document_id: documentId,
    theme_id: themeId,
    name: "Salary Variance Overview",
    description: "Title, accent rule, two chart placeholders, footer (Precision Ledger sample).",
    thumbnail_asset_id: null,
    elements,
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };
}
