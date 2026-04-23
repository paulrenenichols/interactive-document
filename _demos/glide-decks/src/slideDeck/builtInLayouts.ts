import type { LayoutElement, PlaceholderRole, SlideDeckLayout, SlideDeckTheme } from "../types/slideDeck";
import { DEFAULT_SLIDE_HEIGHT_EMU } from "../types/slideDeck/constants";
import { createEmptyTextBoxSpec } from "./defaultTextBoxSpec";
import { getPlaceholderDefaultStyle } from "./placeholderTypography";
import { createSalaryVarianceOverviewLayout, createTitleAccentTwoSquaresLayout } from "./salaryVarianceLayout";
import { contentTopAfterThemeHeaderEmu, slideInnerWidthEmu, SLIDE_MARGIN_EMU } from "./themeHeaderGeometry";

const M = SLIDE_MARGIN_EMU;
const H = DEFAULT_SLIDE_HEIGHT_EMU;

/** Stable ids for built-in layouts (v1 single theme per document). */
export const BUILTIN_LAYOUT_IDS = {
  titleSlide: "b1000000-0000-4000-8000-000000000001",
  titleContent: "b1000000-0000-4000-8000-000000000002",
  twoColumn: "b1000000-0000-4000-8000-000000000003",
  sectionDivider: "b1000000-0000-4000-8000-000000000004",
  blank: "b1000000-0000-4000-8000-000000000005",
  titleOnly: "b1000000-0000-4000-8000-000000000006",
  bigNumber: "b1000000-0000-4000-8000-000000000007",
  salaryVarianceOverview: "b1000000-0000-4000-8000-000000000008",
  titleAccentTwoSquares: "b1000000-0000-4000-8000-000000000009",
} as const;

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

/** slide-deck-spec §5.3 — minimal geometry for structure, not pixel-perfect design. */
export function createBuiltInSlideLayouts(theme: SlideDeckTheme, documentId: string): SlideDeckLayout[] {
  const themeId = theme.id;
  const t = isoNow();
  const innerW = slideInnerWidthEmu();
  const contentTop = contentTopAfterThemeHeaderEmu();
  const bodyHeightBelowHeader = H - M - contentTop;

  const titleSlide: SlideDeckLayout = {
    id: BUILTIN_LAYOUT_IDS.titleSlide,
    document_id: documentId,
    theme_id: themeId,
    name: "Title Slide",
    description: "Deck cover; slide title comes from the theme header.",
    thumbnail_asset_id: null,
    elements: [],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };

  const titleContent: SlideDeckLayout = {
    id: BUILTIN_LAYOUT_IDS.titleContent,
    document_id: documentId,
    theme_id: themeId,
    name: "Title + Content",
    description: "Theme slide title; large body area below.",
    thumbnail_asset_id: null,
    elements: [ph(theme, "el-tc-body", "body", M, contentTop, innerW, bodyHeightBelowHeader, 1, "Body")],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };

  const colW = Math.floor((innerW - M) / 2);
  const twoColumn: SlideDeckLayout = {
    id: BUILTIN_LAYOUT_IDS.twoColumn,
    document_id: documentId,
    theme_id: themeId,
    name: "Two Column",
    description: "Theme slide title; two body columns.",
    thumbnail_asset_id: null,
    elements: [
      ph(theme, "el-2c-left", "body", M, contentTop, colW, bodyHeightBelowHeader, 1, "Left column"),
      ph(theme, "el-2c-right", "body", M + colW + M, contentTop, colW, bodyHeightBelowHeader, 2, "Right column"),
    ],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };

  const sectionBoxH = 900_000;
  const sectionY = contentTop + Math.max(0, Math.floor((bodyHeightBelowHeader - sectionBoxH) / 2));
  const sectionDivider: SlideDeckLayout = {
    id: BUILTIN_LAYOUT_IDS.sectionDivider,
    document_id: documentId,
    theme_id: themeId,
    name: "Section Divider",
    description: "Bold section title centered in the content band below the theme header.",
    thumbnail_asset_id: null,
    elements: [ph(theme, "el-sd-section", "body", M, sectionY, innerW, sectionBoxH, 1, "Section title")],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };

  const blank: SlideDeckLayout = {
    id: BUILTIN_LAYOUT_IDS.blank,
    document_id: documentId,
    theme_id: themeId,
    name: "Blank",
    description: "No placeholders.",
    thumbnail_asset_id: null,
    elements: [],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };

  const titleOnly: SlideDeckLayout = {
    id: BUILTIN_LAYOUT_IDS.titleOnly,
    document_id: documentId,
    theme_id: themeId,
    name: "Title Only",
    description: "Slide title from theme only; open canvas for free-placed elements.",
    thumbnail_asset_id: null,
    elements: [],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };

  const bnValH = 1_000_000;
  const bnLblH = 500_000;
  const bnGap = 100_000;
  const bnBlock = bnValH + bnGap + bnLblH;
  const bnYVal = contentTop + Math.max(0, Math.floor((bodyHeightBelowHeader - bnBlock) / 2));
  const bnYLbl = bnYVal + bnValH + bnGap;
  const bigNumber: SlideDeckLayout = {
    id: BUILTIN_LAYOUT_IDS.bigNumber,
    document_id: documentId,
    theme_id: themeId,
    name: "Big Number",
    description: "KPI value and label below the theme header.",
    thumbnail_asset_id: null,
    elements: [
      ph(theme, "el-bn-val", "body", M, bnYVal, innerW, bnValH, 1, "000"),
      ph(theme, "el-bn-lbl", "subtitle", M, bnYLbl, innerW, bnLblH, 2, "Label"),
    ],
    background_fill_override: null,
    created_at: t,
    updated_at: t,
  };

  const salaryVariance = createSalaryVarianceOverviewLayout(theme, documentId, BUILTIN_LAYOUT_IDS.salaryVarianceOverview);
  const titleAccentTwoSquares = createTitleAccentTwoSquaresLayout(theme, documentId, BUILTIN_LAYOUT_IDS.titleAccentTwoSquares);

  return [titleAccentTwoSquares, titleSlide, titleContent, twoColumn, sectionDivider, blank, titleOnly, bigNumber, salaryVariance];
}
