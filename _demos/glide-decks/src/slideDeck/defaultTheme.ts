import { tokens } from "../theme/tokens";
import type { SlideDeckTheme } from "../types/slideDeck";
import type { BulletLevel } from "../types/slideDeck/text";
import { DEFAULT_SLIDE_HEIGHT_EMU, DEFAULT_SLIDE_WIDTH_EMU } from "../types/slideDeck/constants";
import { BUILTIN_LAYOUT_IDS } from "./builtInLayouts";
import { remToEmu } from "./remToEmu";

function defaultBulletConfig(): BulletLevel[] {
  /** Large enough for `listMarkerGutterPx` (marker + 0.5rem gap) at each level’s `font_size_pt`, including `100.` */
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
 * Default theme from design tokens (slide-deck-spec §4.2 / design-guidelines §1.1).
 * Canvas size is implicit on document; theme carries background fill for slides.
 */
export function createDefaultSlideDeckTheme(documentId: string, themeId: string): SlideDeckTheme {
  const t = isoNow();
  return {
    id: themeId,
    document_id: documentId,
    name: "Default",
    color_palette: {
      accent_1: tokens.colorPrimary,
      accent_2: tokens.colorSecondary,
      accent_3: tokens.colorWarning,
      accent_4: tokens.colorSuccess,
      accent_5: tokens.colorSelection,
      accent_6: tokens.colorDanger,
      dark_1: tokens.colorChrome,
      dark_2: tokens.colorSecondary,
      light_1: tokens.colorSurface,
      light_2: tokens.colorPanel,
    },
    font_config: {
      heading_family: "Poppins",
      heading_weight: 700,
      body_family: "Poppins",
      body_weight: 400,
      monospace_family: "JetBrains Mono",
    },
    bullet_config: defaultBulletConfig(),
    background_fill: {
      kind: "solid",
      color: "light_1",
    },
    master_elements: [],
    default_new_slide_layout_id: BUILTIN_LAYOUT_IDS.titleSlide,
    created_at: t,
    updated_at: t,
  };
}

/** @internal — reserved for future document-level canvas fields */
export function defaultSlideCanvasSizeEmu(): { width: number; height: number } {
  return { width: DEFAULT_SLIDE_WIDTH_EMU, height: DEFAULT_SLIDE_HEIGHT_EMU };
}
