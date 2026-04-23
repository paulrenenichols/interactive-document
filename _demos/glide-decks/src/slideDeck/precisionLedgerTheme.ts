import { tokens } from "../theme/tokens";
import type { SlideDeckTheme } from "../types/slideDeck";
import type { BulletLevel } from "../types/slideDeck/text";
import { BUILTIN_LAYOUT_IDS } from "./builtInLayouts";
import { createPrecisionLedgerThemeHeaderMasterElements } from "./themeHeaderGeometry";
import { precisionLedgerColors } from "./precisionLedgerUi";
import { remToEmu } from "./remToEmu";

/** slide-deck-spec §4.4 product default: unordered glyphs and content offsets from text box content edge. */
function precisionLedgerBulletConfig(): BulletLevel[] {
  /** Matches default theme: indents must exceed gutter from `listMarkerGutterPx` for wide numbered markers. */
  const indentsRem = [4.5, 5.75, 7, 8.25] as const;
  const shapes: BulletLevel["shape"][] = ["disc", "dash", "circle", "square"];
  const fontPt = [18, 16, 14, 13];
  const sizePt = [12, 10, 8, 8];
  return indentsRem.map((rem, i) => ({
    level: (i + 1) as 1 | 2 | 3 | 4,
    shape: shapes[i]!,
    size_pt: sizePt[i]!,
    indent_emu: remToEmu(rem),
    hanging_emu: remToEmu(0.25),
    space_before_pt: 0,
    space_after_pt: i === 0 ? 6 : 4,
    font_size_pt: fontPt[i]!,
    font_bold: false,
    font_italic: false,
  }));
}

function isoNow(): string {
  return new Date().toISOString();
}

/**
 * Slide deck theme aligned with Precision Ledger sample (design/sample-slide-deck-design).
 * Palette slots map to HTML semantic colors; primary accent for charts uses mock red where noted.
 */
export function createPrecisionLedgerSlideDeckTheme(documentId: string, themeId: string): SlideDeckTheme {
  const t = isoNow();
  const base: SlideDeckTheme = {
    id: themeId,
    document_id: documentId,
    name: "Precision Ledger",
    color_palette: {
      accent_1: tokens.colorPrimary,
      accent_2: precisionLedgerColors.secondaryText,
      accent_3: tokens.colorWarning,
      accent_4: tokens.colorSuccess,
      accent_5: tokens.colorSelection,
      accent_6: tokens.colorDanger,
      dark_1: precisionLedgerColors.onSurface,
      dark_2: precisionLedgerColors.secondaryText,
      light_1: precisionLedgerColors.surfaceContainerLow,
      light_2: precisionLedgerColors.surfaceContainerLowest,
    },
    font_config: {
      heading_family: '"Plus Jakarta Sans", Poppins, sans-serif',
      heading_weight: 800,
      body_family: "Poppins, sans-serif",
      body_weight: 400,
      monospace_family: "JetBrains Mono, monospace",
    },
    bullet_config: precisionLedgerBulletConfig(),
    background_fill: {
      kind: "solid",
      color: "light_2",
    },
    master_elements: [],
    default_new_slide_layout_id: BUILTIN_LAYOUT_IDS.bigNumber,
    created_at: t,
    updated_at: t,
  };
  return {
    ...base,
    master_elements: createPrecisionLedgerThemeHeaderMasterElements(base),
  };
}
